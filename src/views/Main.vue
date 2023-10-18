<template>
    <MyModal :isActive="isRemoveCardModalOpen" @on-close="isRemoveCardModalOpen = false">
        <template v-slot:title>
            {{t('Attention')}}!
        </template>

        <template v-slot:main>
            {{ t('Are you sure for deleting the card') }}?
        </template>

        <template v-slot:actions>
            <div class="modal__content-actions__button button button-green" @click="removeCard()">{{t('Delete')}}</div>
            <div class="modal__content-actions__button button button-grey" @click="isRemoveCardModalOpen = false">{{t('Cancel')}}</div>
        </template>
    </MyModal>

    <MyModal :isActive="isLimitForAddingCardsModalOpen" @on-close="isLimitForAddingCardsModalOpen = false">
        <template v-slot:title>
            {{t('Attention')}}!
        </template>

        <template v-slot:main>
            {{ t('You have exceeded your card limit') }} (5)!
        </template>

        <template v-slot:actions>
            <div class="modal__content-actions__button button button-grey" @click="isLimitForAddingCardsModalOpen = false">{{t('Cancel')}}</div>
        </template>
    </MyModal>

    <MyModal :isActive="isLimitForAddingCardToFavoritesModalOpen" @on-close="isLimitForAddingCardToFavoritesModalOpen = false">
        <template v-slot:title>
            {{t('Attention')}}!
        </template>

        <template v-slot:main>
            {{ t('You have exceeded your favorites city limit') }} (5)!
        </template>

        <template v-slot:actions>
            <div class="modal__content-actions__button button button-grey" @click="isLimitForAddingCardToFavoritesModalOpen = false">{{t('Cancel')}}</div>
        </template>
    </MyModal>

    <MyModal :isActive="isCityNotFoundModalOpen" @on-close="isCityNotFoundModalOpen = false">
        <template v-slot:title>
            {{t('Attention')}}!
        </template>

        <template v-slot:main>
            {{ t('City is not found') }}!
        </template>

        <template v-slot:actions>
            <div class="modal__content-actions__button button button-grey" @click="isCityNotFoundModalOpen = false">{{t('Cancel')}}</div>
        </template>
    </MyModal>

    <div class="actions">
        <div class="actions__button button button-green" @click="addNewCard('')">
            &plus; {{ t('Add new card') }}
        </div>
    </div>
    
    <MyCards
        :cards="cards"
        :is-card-loading="isCardLoading"
        :isAllowToRemoveCard="true"
        :isAllowToSearch="true"
        @on-search="(card, index) => getWeather(card, index)"
        @limit-favorite-cards="isLimitForAddingCardToFavoritesModalOpen = true"
        @on-open-remove-card-modal="(card) => openRemoveCardModal(card)"
        @on-toggle-time-range="(val, card, index) => toggleTimeRange(card, index, val)"
        @on-measure-change="(card, val, index) => changeMeasure(card, val, index)"
    >
    </MyCards>
    
</template>

<script setup>
import axios from 'axios'
import Chart from 'chart.js/auto'
import MyModal from '../components/Modal.vue'
import MyCards from '../components/Cards.vue'

const {t, locale} = useI18n()

const cards = ref([])

const current_card = ref({})

const isRemoveCardModalOpen = ref(false)
const isLimitForAddingCardsModalOpen = ref(false)
const isLimitForAddingCardToFavoritesModalOpen = ref(false)
const isCityNotFoundModalOpen = ref(false)
const isCardLoading = ref(false)

const ip_api_key = import.meta.env.VITE_IP_API_KEY
const weather_api_key = import.meta.env.VITE_WEATHER_API_KEY
const data_by_ip = ref(null)

const charts = {}

axios.get(`https://api.ipdata.co?api-key=${ip_api_key}`).then(res => {
    isCardLoading.value = true
    data_by_ip.value = res.data

    addNewCard(data_by_ip.value.city)

    getWeather(cards.value[0], 0)
}).catch(error => {

}).finally(r => {
})

function getWeather(obj, index){
    isCardLoading.value = true
    axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${obj.city}&appid=${weather_api_key}&lang=${locale.value}&units=${obj.display_data.selected_measure.name}`).then(res => {
        obj.weather_data = res.data

        obj.weather_data.list.forEach(item => {
            item.weather[0].img_url = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
        });

        const current_data = {
            img_url: obj.weather_data.list[0].weather[0].img_url,
            current_temp: obj.weather_data.list[0].main.temp,
            feels_like: obj.weather_data.list[0].main.feels_like,
            max_temp: obj.weather_data.list[0].main.temp_max,
            min_temp: obj.weather_data.list[0].main.temp_min,
            description: obj.weather_data.list[0].weather[0].description,
            time: new Date().toLocaleTimeString().slice(0, 5)
        }

        Object.assign(obj.display_data.current_data, current_data)

        obj.display_data.week_time_range = ['d', 'n']

        obj.city_id = obj.weather_data.city.id

        obj.isFavorite = checkOnFavorite(obj.city_id)

        
    }).then(r => {
        getDayData(obj, index)
        getByWeek(obj, index, obj.weather_data.list)
    })
    .catch(error => {
        console.log(error);
        obj.display_data = {
            selected_widget: 'day',
            selected_measure: {
                name: 'metric',
                desc: '°C'
            }
        }

        if(charts[`day_chart_${index}`])  charts[`day_chart_${index}`] = null
        if(charts[`week_chart_${index}`])  charts[`week_chart_${index}`] = null

        if(error.response?.status == 404){
            isCityNotFoundModalOpen.value = true
            obj.city_id = ''
        }
        isCardLoading.value = false
    }).finally(() => {
        isCardLoading.value = false
        // console.log(obj.display_data.current_data);
    })
}

function addNewCard(city=''){
    if(cards.value.length < 5){
        cards.value.push({
            id: Date.now(),
            city: city ?? '',
            city_id: '',
            isFavorite: false,
            display_data:{
                selected_widget: 'day',
                selected_measure: {
                    name: 'metric',
                    desc: '°C'
                },
                current_data: {
                    img_url: '',
                    current_temp: '',
                    feels_like: '',
                    max_temp: '',
                    min_temp: '',
                    description: '',
                    time: ''
                },
                day:[],
                week: [],
                week_time_range: ['d', 'n']
            }
        })
    }
    else{
        isLimitForAddingCardsModalOpen.value = true
    }
}

function checkOnFavorite(city){
    const favorite_list = JSON.parse(localStorage.getItem('favorite_list')) ?? []
    return favorite_list.find(item => item.city_id == city) != null
}

function getDayData(obj, index){
    obj.display_data.day = []
    for(let i=0; i < 8; i++){
        const obj_data = {
            date: obj.weather_data.list[i].dt_txt,
            temp: obj.weather_data.list[i].main.temp,
            img_url: obj.weather_data.list[i].weather[0].img_url,
            description: obj.weather_data.list[i].weather[0].description,
        }

        obj.display_data.day.push(obj_data)
    }

    drawChart(`day_chart_${index}`, obj.display_data.day.map(row => row.date), obj.display_data.day.map(row => row.temp))
}

function getByWeek(obj, index, weather_data){
    const group_by_days = Object.groupBy(weather_data, ({dt_txt}) => dt_txt.slice(0, 10))
    obj.display_data.week = []
    Object.values(group_by_days).forEach((day, index) => {
        const avg_temp = (day.reduce((total, cur) => total + cur.main.temp, 0) / day.length).toFixed(2)
        const obj_data = {
            avg_temp: avg_temp,
            date: Object.keys(group_by_days)[index],
            img_url: `https://openweathermap.org/img/wn/${day[Math.floor(day.length / 2)].weather[0].icon}@2x.png`
        }
        obj.display_data.week.push(obj_data)
    })

    drawChart(`week_chart_${index}`, obj.display_data.week.map(row => row.date), obj.display_data.week.map(row => row.avg_temp))    
}

function drawChart(chart_id, labels, data){
    if(!charts[chart_id]){
        charts[chart_id] = new Chart(
            document.getElementById(chart_id).getContext('2d'),
            {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                    {
                        data: data
                    }
                    ]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
                    },
                    scales: {
                        x: {
                            ticks: {
                                callback: function(value, index, ticks) {
                                    return ''
                                }
                            }
                        }
                    }
                }
            }
        );
    }
    else{
        charts[chart_id].data.labels = labels
        charts[chart_id].data.datasets[0].data = data
        charts[chart_id].update()
    }
}

function openRemoveCardModal(card){
    current_card.value = card
    isRemoveCardModalOpen.value = true
}

function removeCard(){
    cards.value = cards.value.filter(item => item.id != current_card.value.id)
    isRemoveCardModalOpen.value = false
}

function toggleTimeRange(obj, index, time){
    const card = cards.value.find(item => item.id == obj.id)
    const time_range = card.display_data.week_time_range
    
    if(time_range.includes(time)) time_range.splice(time_range.indexOf(time), 1)
    else time_range.push(time)

    let weather_data = []

    weather_data = obj.weather_data.list.filter(item => time_range.includes(item.sys.pod))
    getByWeek(obj, index, weather_data)
}

function changeMeasure(obj, val, index){
    if(val == 'metric'){
        obj.display_data.selected_measure.desc = '°C'
    }
    else if(val == 'imperial') {
        obj.display_data.selected_measure.desc = '°F'
    }

    getWeather(obj, index)
}
</script>