<template>
    <main-layout>
        <silde-up class="chartArea" :sildeUp="showChart">
            <div class="flex filterbar">
                <div class="filter-select">
                    <v-select :options="products" :selected='selectedIndex+1' :on-change="switchProduct">
                    </v-select>
                </div>
                <div class="filter-data">
                    <div class="cr">
                        <ani-num :value='dproduct[key]' class="fd-number"></ani-num>
                        <span class="fd-text">{{filterText}}量</span>
                    </div>
                </div>
                <div class="filter-data align-right">
                    <span class="fd-number">{{dproduct[key]/sumproducts[key] | percent}}</span>
                    <span class="fd-text">占比</span>
                </div>
                <div class="arrow"></div>
                <div class="line"></div>
            </div>
            <swiper :on-switch="switchfilterItemIndex" ref="chartswiper">
                <pie-chart class="swiper-item" v-for="filteritem in filterkeys" :key="filteritem.key" :width="width" :height="height" :options="filteritem.options" :selectedIndex="selectedIndex" :showlegend="false">
                    <div class="chart-title">
                        <i class="iconfont icon-table"></i>
                        <span>{{filteritem.text}}</span>
                    </div>
                </pie-chart>
            </swiper>
        </silde-up>
        <div class="dataArea" v-show="selectedIndex<0">
            <div class="uparrow" @click="switchChart">
                <arrow :angleup="showChart"> </arrow>
            </div>
            <div class="datafilterbar" v-show="!showChart">
                <span v-for="(filteritem,fidx) in filterkeys" :class="{active:filteritem.key === key}" v-on:click="switchfilterItem(filteritem,fidx)">{{filteritem.text}}</span>
            </div>
            <div class="dataheader">
                <span>网站名称</span>
                <span>访客量</span>
                <span>占比</span>
            </div>
            <div class="datarows">
                <div class="datarow" v-for="row in datarows" v-on:click="changeStartAngle(row)">
                    <span class="text-l"><i class="fa fa-square colorpoint" :style="{color:colors(row.index)}"></i> {{row.name}}</span>
                    <span>{{row[key]}}</span>
                    <span>{{row[key]/sumproducts[key] | percent}}</span>
                </div>
            </div>
        </div>
        <div class="dataArea" v-show="selectedIndex>=0">
            <div class="uparrow" @click="switchChart">
                <arrow :angleup="showChart"> </arrow>
            </div>
            <div class="dataheader">
                <span>时间区间</span>
                <span>访客量</span>
                <span>占比</span>
            </div>
            <div class="datarows">
                <div class="datarow" v-for="filteritem in filterkeys">
                    <span class="text-l pd-hor-sm">{{filteritem.text}}</span>
                    <span>{{dproduct[filteritem.key]}}</span>
                    <span>{{dproduct[filteritem.key]/sumproducts[filteritem.key] | percent}}</span>
                </div>
            </div>
        </div>
    </main-layout>
</template>
<script>
import MainLayout from '../layouts/Main.vue';
import PieChart from '../components/PieChart.vue';
import VSelect from '../components/Select.vue';
import Arrow from '../components/reuse/Arrow.vue';
import SildeUp from '../components/reuse/SildeUp.vue';
import Swiper from '../components/reuse/Swiper.vue';
import AniNum from '../components/AnimationNumber.vue';
import xhttp from '../xhttp';
import config from '../gConfig';
import mytool from '../mytool';
export default {
    data: function() {
        return {
            showChart: true,
            width: config.chartsize.width,
            height: config.chartsize.height,
            selectedIndex: -1,
            datarows: [],
            dproduct: {
                UV: 0,
                UV7: 0,
                UV30: 0,
                UVALL: 0
            },
            total: 0,
            key: 'UVALL',
            filterkeys: [{
                key: 'UVALL',
                text: '历史总访客',
                options: {
                    inited: false
                }
            }, {
                key: 'UV30',
                text: '近30日访客',
                options: {
                    inited: false
                }
            }, {
                key: 'UV7',
                text: '近7日访客',
                options: {
                    inited: false
                }
            }, {
                key: 'UV',
                text: '昨日访客',
                options: {
                    inited: false
                }
            }],
            arrowStyle: {},
            lineStyle: {},
            colors: config.color,
            products: [{
                key: 'all',
                value: '全部产品'
            }],
            sumproducts: {
                UV: 0,
                UV7: 0,
                UV30: 0,
                UVALL: 0
            },
            chartData: []
        }
    },
    computed: {
        filterText: function() {
            var vm = this;
            for (var index in vm.filterkeys) {
                if (vm.key == vm.filterkeys[index].key) {
                    return vm.filterkeys[index].text;
                }
            }
        }
    },
    components: {
        MainLayout: MainLayout,
        PieChart: PieChart,
        VSelect: VSelect,
        Arrow: Arrow,
        SildeUp: SildeUp,
        AniNum: AniNum,
        Swiper: Swiper
    },
    created: function() {
        this.fetchData()
    },
    methods: {
        fetchData: function() {
            var that = this;
            xhttp.get('/webSubscriber',
                null,
                function(res) {
                    that.initData(res.data);
                    that.switchProduct(that.products[0]);
                });
        },
        initData: function(data) {
            var vm = this;
            var topproducts = [{
                key: 'all',
                value: '全部产品'
            }];
            var products = vm.chartData = data;
            for (var i = 0; i < products.length; i++) {
                var product = products[i];
                topproducts.push({
                    key: product.displayName,
                    value: product.displayName
                });
                vm.datarows.push(Object.assign(product, {
                    name: products[i].displayName,
                    index: i
                }));
                for (var index in vm.filterkeys) {
                    var key = vm.filterkeys[index].key;
                    vm.sumproducts[key] += parseInt(product[key]);
                    vm.filterkeys[index].options = vm.packagedOption(key)
                }
            };
            vm.products = topproducts;
        },
        packagedOption: function(key) {
            var vm = this;
            var data = mytool.getArray(vm.datarows, key);
            return Object.assign({}, {
                data: data,
                inited: true
            });
        },
        changeStartAngle: function(row) {
            this.dproduct = row;
            this.selectedIndex = row.index;
        },
        switchProduct: function(product) {
            var vm = this;
            if (product.key == 'all') {
                vm.dproduct = vm.sumproducts;
                this.selectedIndex = -1;
            } else {
                vm.datarows.forEach(function(item, index) {
                    if (product.key === item.name) {
                        vm.changeStartAngle(item);
                    }
                })
            }
        },
        switchChart: function() {
            this.showChart = !this.showChart;
        },
        switchfilterItemIndex: function(index) {
            this.switchfilterKey(this.filterkeys[index].key);
        },
        switchfilterItem: function(item, index) {
            this.key = item.key;
            this.$refs.chartswiper.$emit('$Swiper:switch', index);
        },
        switchfilterKey: function(key) {
            this.key = key;
        }
    }
}
</script>
