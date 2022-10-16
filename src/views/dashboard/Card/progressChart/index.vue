<template>
  <div ref="charts" class="charts" />
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'ProgressChart',
  mounted() {
    // 初始化echarts实例
    const progressChart = echarts.init(this.$refs.charts)
    // 配置数据
    progressChart.setOption({
      xAxis: {
        // 隐藏x轴
        show: false,
        // 最小值与最大值
        min: 0,
        max: 100
      },
      yAxis: {
        // 隐藏y轴
        show: false,
        // 均分
        type: 'category'
      },
      series: {
        type: 'bar',
        data: [78],
        // 柱状图的宽度
        barWidth: 10,
        // 柱条的颜色
        color: 'yellowgreen',
        // 柱条的背景颜色设置（需将showBackground先设为true）
        showBackground: true,
        backgroundStyle: {
          color: '#eee'
        },
        // 文本标签
        label: {
          show: true,
          // 改变文本内容
          formatter: '|',
          // 文本标签的位置
          position: 'right'
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

<style>
.charts {
  width: 100%;
  height: 100%;
}
</style>
