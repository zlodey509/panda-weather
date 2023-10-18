<template>
    <div class="cards">
        <div class="overlay" v-show="isCardLoading">
            <div class="overlay__inner">
                <div class="overlay__content"><span class="spinner"></span></div>
            </div>
        </div>
        <div class="card" v-for="(card, index) in cards">
            {{ card }}
            <div class="row card__top_row">
                <div class="card__input">
                    <input type="text" :list="`cities_input_${index}`" :disabled="!isAllowToSearch" v-model="card.city" :placeholder="t('Enter the city')">
                    <datalist :id="`cities_input_${index}`">
                        <option v-for="city in cities_list" :value="city"></option>
                    </datalist>
                    <svg v-if="isAllowToSearch" class="card__input-search_icon" @click="$emit('onSearch', card, index)" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 50 50">
                        <path d="M 21 3 C 11.601563 3 4 10.601563 4 20 C 4 29.398438 11.601563 37 21 37 C 24.355469 37 27.460938 36.015625 30.09375 34.34375 L 42.375 46.625 L 46.625 42.375 L 34.5 30.28125 C 36.679688 27.421875 38 23.878906 38 20 C 38 10.601563 30.398438 3 21 3 Z M 21 7 C 28.199219 7 34 12.800781 34 20 C 34 27.199219 28.199219 33 21 33 C 13.800781 33 8 27.199219 8 20 C 8 12.800781 13.800781 7 21 7 Z"></path>
                    </svg>
                </div>
                <div class="card__actions">
                    <svg v-if="card.city_id" class="card__actions-heart" v-bind:class="{'active': card.isFavorite}" @click="AddOrRemoveFromFavorite(card)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 4.419c-2.826-5.695-11.999-4.064-11.999 3.27 0 7.27 9.903 10.938 11.999 15.311 2.096-4.373 12-8.041 12-15.311 0-7.327-9.17-8.972-12-3.27z"/></svg>
                    <span v-if="isAllowToRemoveCard" class="card__actions-close closemark" @click="$emit('onOpenRemoveCardModal', card)">&times;</span>
                </div>
            </div>
            <div class="row" v-if="card.city_id">
                <div>
                    <input type="radio" :name="`measure_${index}`" :value="'metric'" @change="$emit('onMeasureChange', card, 'metric', index)" :id="`first_measure_${index}`" v-model="card.display_data.selected_measure.name">
                    <label :for="`first_measure_${index}`">{{t('Celcius')}}</label>
                </div>
                <div>
                    <input type="radio" :name="`measure_${index}`" :value="'imperial'" @change="$emit('onMeasureChange', card, 'imperial', index)" :id="`second_measure_${index}`" v-model="card.display_data.selected_measure.name">
                    <label :for="`second_measure_${index}`">{{t('Fahrenheit')}}</label>
                </div>
            </div>
            <div class="card__current_data" v-if="card.city_id">
                <div class="card__current_data-head">
                    <div class="card__current_data-head__time">
                        {{ card.display_data.current_data?.time }}
                    </div>
                    <div class="card__current_data-head__img">
                        <img :src="card.display_data.current_data?.img_url" alt="">
                    </div>
                    <div class="card__current_data-head__description">
                        {{ card.display_data.current_data?.description }}
                    </div>
                </div>
                <div class="card__current_data-main">
                    <div class="card__current_data-main__row">
                        {{ t('Current temperature') }}: <strong>{{ card.display_data.current_data?.current_temp }}{{ card.display_data.selected_measure.desc }}</strong>
                    </div>
                    <div class="card__current_data-main__row">
                        {{ t('Feels like') }}: <strong>{{ card.display_data.current_data?.feels_like }}{{ card.display_data.selected_measure.desc }}</strong>
                    </div>
                    <div class="card__current_data-main__row">
                        <span>{{ t('Max') }}: <strong>{{ card.display_data.current_data?.max_temp }}{{ card.display_data.selected_measure.desc }}</strong>, </span>
                        <span>{{ t('Min') }}: <strong>{{ card.display_data.current_data?.min_temp }}{{ card.display_data.selected_measure.desc }}</strong></span>
                    </div>
                </div>
            </div>
            <div class="card__data_by_period" v-if="card.city_id">
                <div class="row card__data_by_period-row">
                    <div class="card__data_by_period-choose_buttons">
                        <div class="card__data_by_period-choose_buttons__item" 
                            v-bind:class="{'active': card.display_data.selected_widget == 'day'}"
                            @click="card.display_data.selected_widget = 'day'">
                            {{ t('One day') }}
                        </div>
                        <div class="card__data_by_period-choose_buttons__item" 
                            v-bind:class="{'active': card.display_data.selected_widget == 'week'}"
                            @click="card.display_data.selected_widget = 'week'">
                            {{ t('Week') }}
                        </div>
                    </div>
                    <div class="card__data_by_period-choose_buttons" v-if="card.display_data.selected_widget == 'week'">
                        <div class="card__data_by_period-choose_buttons__item" 
                            v-bind:class="{'active': card.display_data.week_time_range.includes('d')}"
                            @click="$emit('onToggleTimeRange', 'd', card, index)">
                            {{ t('Day') }}
                        </div>
                        <div class="card__data_by_period-choose_buttons__item" 
                            v-bind:class="{'active': card.display_data.week_time_range.includes('n')}"
                            @click="$emit('onToggleTimeRange', 'n', card, index)">
                            {{ t('Night') }}
                        </div>
                    </div>
                </div>
                <div class="card__data_by_period-info" v-if="card.display_data.selected_widget == 'day'">
                    <div class="card__data_by_period-info__item" v-for="item in card.display_data.day">
                        <div class="card__data_by_period-info__item-img">
                            <img :src="item.img_url" alt="">
                        </div>
                        <div class="card__data_by_period-info__item-date">
                            {{ item.date }}
                        </div>
                        <div>
                            <strong>
                                {{ item.temp }}{{ card.display_data.selected_measure.desc }}
                            </strong>
                        </div>
                    </div>
                </div>
                <div class="card__data_by_period-info" v-else-if="card.display_data.selected_widget == 'week'">
                    <div class="card__data_by_period-info__item" v-if="card.display_data.week.length" v-for="item in card.display_data.week">
                        <div class="card__data_by_period-info__item-img">
                            <img :src="item.img_url" alt="">
                        </div>
                        <div class="card__data_by_period-info__item-date">
                            {{ item.date }}
                        </div>
                        <div>
                            <strong>
                                {{ item.avg_temp }}{{ card.display_data.selected_measure.desc }}
                            </strong>
                        </div>
                    </div>
                    <div v-else class="card__data_by_period-info__empty">
                        <span>{{ t('No data') }}!</span>
                    </div>
                </div>
                <div class="card__data_by_period-title">
                    <strong>
                        {{ t('Graphic') }}
                    </strong>
                </div>
                <canvas v-show="card.display_data.selected_widget == 'day'" :id="`day_chart_${index}`"></canvas>
                <canvas v-show="card.display_data.selected_widget == 'week'" :id="`week_chart_${index}`"></canvas>
            </div>
        </div>
    </div>
    
</template>

<script setup>
const {t, locale} = useI18n()
import {defineEmits} from 'vue'

const emit = defineEmits(['limitFavoriteCards'])

const props = defineProps(['cards', 'isCardLoading', 'isAllowToRemoveCard', 'isAllowToSearch'])

const cities_list = [
  'New York City',
  'London',
  'Tokyo',
  'Paris',
  'Beijing',
  'Kyiv',
  'Mumbai',
  'Los Angeles',
  'Chicago',
  'Sydney',
  'Mexico City',
  'Rio de Janeiro',
  'Cairo',
  'Istanbul',
  'Dubai',
  'Toronto',
  'Hong Kong',
  'Buenos Aires',
  'Singapore',
  'Bangkok',
  'Rome',
  'Berlin',
  'Seoul',
  'Johannesburg',
  'Barcelona',
  'Kuala Lumpur',
  'San Francisco',
  'Vancouver',
  'Amsterdam',
  'Riyadh'
]

function AddOrRemoveFromFavorite(obj){
    let favorite_list = JSON.parse(localStorage.getItem('favorite_list')) ?? []
    if(!obj.isFavorite){
        if(favorite_list.length < 5){
            obj.isFavorite = true
            favorite_list.push(obj)
            localStorage.setItem('favorite_list', JSON.stringify(favorite_list))
        }
        else{
            emit('limitFavoriteCards')
        }
    }
    else{
        favorite_list = favorite_list.filter(item => item.city != obj.city)
        localStorage.setItem('favorite_list', JSON.stringify(favorite_list))
        obj.isFavorite = false
    }
}
</script>