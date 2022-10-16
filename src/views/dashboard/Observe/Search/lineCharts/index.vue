<template>
  <div>
    <div class="header">
      <span class="search-header">搜索用户数</span>
      <i class="el-icon-warning-outline" />
    </div>
    <div class="main">
      <span class="main-title">12321</span>
      <span class="main-content">17.1</span>
      <i class="el-icon-caret-top" style="color: red" />
      <i class="el-icon-caret-bottom" style="color: green" />
    </div>
    <div class="footer">
      <div ref="charts" class="charts" />
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'LineCharts',
  mounted() {
    // 初始化echarts实例
    const lineCharts = echarts.init(this.$refs.charts)
    // 配置数据
    lineCharts.setOption({
      xAxis: {
        // 隐藏x轴
        show: false,
        type: 'category'
      },
      yAxis: {
        // 隐藏y轴
        show: false
      },
      series: {
        type: 'line',
        data: [10, 7, 21, 15, 33, 12, 50, 43, 88, 66, 19],
        // 圆滑的曲线
        smooth: true,
        // 拐点样式的设置
        itemStyle: {
          opacity: 0
        },
        // 线条的样式
        lineStyle: {
          color: 'green'
        },
        // 区域填充的设置
        areaStyle: {
          // 渐变的紫色
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'green' // 0% 处的颜色
              },
              {
                offset: 1,
                color: '#fff' // 100% 处的颜色
              }
            ],
            global: false // 缺省为 false
          }
        }
      },
      // 布局
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    })
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: gray;
}
.search-header {
  margin-right: 20px;
}
.main {
  margin: 10px 0px;
}
.main-title {
  margin-right: 30px;
}
.main-content {
  margin-right: 10px;
  font-size: 13px;
  color: gray;
}
.charts {
  width: 100%;
  height: 50px;
}
</style>
