<template>
    <main-layout>
        <div class="abscenter pd-ver-sm flex-stay">
            <div class="btn-group">
                <div class="btn" :class="{active:range.key==dayrange}" v-for="range in dayRangeArr" @click="switchDaysRange(range.key)">{{range.text}}</div>
            </div>
        </div>
        <div class="tabs pd-ver-sm flex-stay">
            <div class="tab" @click="switchTab(0)">
                <div class="tabtile" :class="{active:tabIndex==0}">新闻排行</div>
            </div>
            <div class="tab " @click="switchTab(1)">
                <div class="tabtile" :class="{active:tabIndex==1}">活动排行</div>
            </div>
        </div>
        <div class="loading-circles  pd-ver-sm" v-show="loading"></div>
        <swiper class="flex" ref="tabswiper" :showBtn="false" v-if="!loading">
            <div class="rankArea dataArea swiper-item">
                <div class="dataheader">
                    <span @click="switchNewsRank">{{newsRank?'顺位':'末位'}}<i class="fa " :class="newsRank?'fa-sort-amount-asc':'fa-sort-amount-desc'"></i></span>
                    <span>新闻标题</span>
                    <span>UV</span>
                    <span>PV</span>
                </div>
                <div class="datarows" v-show="newsRank">
                    <div class="datarow " v-for="(row,i) in topnews">
                        <span>{{i+1}}</span>
                        <v-clamp class="text-l title">{{row.title}}</v-clamp>
                        <ani-num :value="row.uv || 0"></ani-num>
                        <ani-num :value="row.pv || 0"></ani-num>
                    </div>
                </div>
                <div class="datarows" v-show="!newsRank">
                    <div class="datarow " v-for="(row,i) in bottomnews">
                        <span>{{bottomnews.length-i}}</span>
                        <v-clamp class="text-l title">{{row.title}}</v-clamp>
                        <ani-num :value="row.uv || 0"></ani-num>
                        <ani-num :value="row.pv || 0"></ani-num>
                    </div>
                </div>
            </div>
            <div class="rankArea dataArea swiper-item">
                <div class="dataheader">
                    <span @click="switchActiveRank">{{activeRank?'顺位':'末位'}}<i class="fa " :class="activeRank?'fa-sort-amount-asc':'fa-sort-amount-desc'"></i></span>
                    <span>活动标题</span>
                    <span>UV</span>
                    <span>PV</span>
                </div>
                <div class="datarows" v-show="activeRank">
                    <div class="datarow " v-for="(row,i) in topactivities">
                        <span>{{i+1}}</span>
                        <v-clamp class="text-l title">{{row.title}}</v-clamp>
                        <ani-num :value="row.uv || 0"></ani-num>
                        <ani-num :value="row.pv || 0"></ani-num>
                    </div>
                </div>
                <div class="datarows" v-show="!activeRank">
                    <div class="datarow " v-for="(row,i) in bottomactivities">
                        <span>{{bottomactivities.length-i}}</span>
                        <v-clamp class="text-l title">{{row.title}}</v-clamp>
                        <ani-num :value="row.uv || 0"></ani-num>
                        <ani-num :value="row.pv || 0"></ani-num>
                    </div>
                </div>
            </div>
        </swiper>
    </main-layout>
</template>
<script>
import MainLayout from '../layouts/Main.vue';
import Swiper from '../components/reuse/Swiper.vue';
import AniNum from '../components/AnimationNumber.vue';
import xhttp from '../xhttp';
import VClamp from '../components/reuse/VClamp.vue';
import config from '../gConfig';
import mytool from '../mytool';

export default {
    data: function() {
        return {
            showChart: true,
            width: config.chartsize.width,
            height: config.chartsize.height,
            tabIndex: 0,
            newsRank: true,
            activeRank: true,
            dayrange: 30,
            topnews: [],
            bottomnews: [],
            topactivities: [],
            bottomactivities: [],
            loading: true,
            dayRangeArr: [{
                key: 1,
                text: '昨日'
            }, {
                key: 7,
                text: '近一周'
            }, {
                key: 30,
                text: '近一月'
            }]
        }
    },
    components: {
        MainLayout: MainLayout,
        Swiper: Swiper,
        AniNum: AniNum,
        VClamp: VClamp
    },
    created: function() {
        this.fetchData()
    },
    methods: {
        fetchData: function() {
            var vm = this;
            vm.tabIndex = 0;
            vm.loading = true;
            xhttp.get('/zjxwRank', {
                    days: vm.dayrange
                },
                function(res) {
                    vm.initData(res);
                    vm.loading = false;
                });
        },
        initData: function(resp) {
            this.topnews = resp.top_news;
            this.bottomnews = resp.bottom_news;
            this.topactivities = resp.top_activities;
            this.bottomactivities = resp.bottom_activities;
        },
        switchTab: function(index) {
            this.tabIndex = index;
            this.$refs.tabswiper.$emit('$Swiper:switch', index);
        },
        switchNewsRank: function() {
            this.newsRank = !this.newsRank
        },
        switchActiveRank: function() {
            this.activeRank = !this.activeRank
        },
        switchDaysRange: function(range) {
            this.dayrange = range;
            this.fetchData()
        }
    }
}
</script>
