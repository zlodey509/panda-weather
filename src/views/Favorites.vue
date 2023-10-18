<template>
    <MyCards
        v-if="cards.length"
        :cards="cards"
        :is-card-loading="isCardLoading"
        :isAllowToRemoveCard="false"
        :isAllowToSearch="false"
        @on-toggle-time-range="(val, card, index) => toggleTimeRange(card, index, val)"
        @on-measure-change="(card, val) => changeMeasure(card, val)"
    >
    </MyCards>
    <div v-else class="favorite_cards_empty">
        {{ t('No favorite cities') }}!
    </div>
</template>

<script setup>
import axios from 'axios'
import Chart from 'chart.js/auto'
import MyCards from '../components/Cards.vue'

const {t, locale} = useI18n()

const weather_api_key = import.meta.env.VITE_WEATHER_API_KEY

const cards = ref([])
cards.value = JSON.parse(localStorage.getItem('favorite_list'))

const isCardLoading = ref(false)

const charts = {}

cards.value.forEach((card, index) => {
    getWeather(card, index)
})

function getWeather(obj, index){
    obj = cards.value.find(item => item.id == obj.id)
    isCardLoading.value = true
    axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${obj.city}&appid=${weather_api_key}&lang=${locale.value}&units=${obj.display_data.selected_measure.name}`).then(res => {
        obj.weather_data = res.data

        obj.weather_data.list.forEach(item => {
            item.weather[0].img_url = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
        });

        obj.display_data.current_data = {
            img_url: obj.weather_data.list[0].weather[0].img_url,
            current_temp: obj.weather_data.list[0].main.temp,
            feels_like: obj.weather_data.list[0].main.feels_like,
            max_temp: obj.weather_data.list[0].main.temp_max,
            min_temp: obj.weather_data.list[0].main.temp_min,
            description: obj.weather_data.list[0].weather[0].description,
            time: new Date().toLocaleTimeString().slice(0, 5)
        }

        obj.display_data.week_time_range = ['d', 'n']

        obj.isFavorite = true
    }).then(r => {
        getDayData(obj, index)
        getByWeek(obj, index, obj.weather_data.list)
    })
    .catch(error => {
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
        }
        isCardLoading.value = false
    }).finally(() => {
        isCardLoading.value = false
    })
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
    // const group_by_days = Object.groupBy(weather_data, ({dt_txt}) => dt_txt.slice(0, 10))    * not supported by Safari :(*
    const weather_days_arr = [...new Set(weather_data.map(item => item.dt_txt.slice(0, 10)))]
    const weather_days_obj = {}
    weather_days_arr.forEach(item => weather_days_obj[item] = [])
    weather_data.forEach(item => {
        weather_days_obj[item.dt_txt.slice(0, 10)].push(item)
    })
    obj.display_data.week = []
    Object.values(weather_days_obj).forEach((day, index) => {
        const avg_temp = (day.reduce((total, cur) => total + cur.main.temp, 0) / day.length).toFixed(2)
        const obj_data = {
            avg_temp: avg_temp,
            date: Object.keys(weather_days_obj)[index],
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

function toggleTimeRange(obj, index, time){
    const card = cards.value.find(item => item.id == obj.id)
    const time_range = card.display_data.week_time_range
    
    if(time_range.includes(time)) time_range.splice(time_range.indexOf(time), 1)
    else time_range.push(time)

    let weather_data = []

    weather_data = obj.weather_data.list.filter(item => time_range.includes(item.sys.pod))
    getByWeek(obj, index, weather_data)
}

function changeMeasure(obj, val){
    if(val == 'metric'){
        obj.display_data.selected_measure.desc = '°C'
    }
    else if(val == 'imperial') {
        obj.display_data.selected_measure.desc = '°F'
    }

    const index = cards.value.findIndex(item => item.id == obj.id)

    getWeather(obj, index)
}
</script>