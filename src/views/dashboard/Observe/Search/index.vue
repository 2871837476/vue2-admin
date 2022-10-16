<template>
  <el-card>
    <!-- 上 -->
    <div slot="header" class="clearfix">
      <div class="search-header">
        <span>线上热门搜索</span>
        <el-dropdown>
          <span>
            <i class="el-icon-more" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>黄金糕</el-dropdown-item>
            <el-dropdown-item>狮子头</el-dropdown-item>
            <el-dropdown-item>螺蛳粉</el-dropdown-item>
            <el-dropdown-item>双皮奶</el-dropdown-item>
            <el-dropdown-item>蚵仔煎</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <!-- 中 -->
    <div>
      <!-- 图表 -->
      <el-row :gutter="10">
        <el-col :span="12">
          <LineChart />
        </el-col>
        <el-col :span="12">
          <LineChart />
        </el-col>
      </el-row>
      <!-- table表格 -->
      <el-table :data="tableData" style="width: 100%; margin-top: 10px;" border>
        <el-table-column type="index" label="排名" width="80" />
        <el-table-column prop="address" label="搜索关键字" />
        <el-table-column prop="date" label="用户数" sortable />
        <el-table-column prop="name" label="周涨幅" sortable />
      </el-table>
      <!-- 下:分页器 -->
      <el-pagination layout="prev, pager, next" :total="1000" class="pagination" />
    </div>
  </el-card>
</template>

<script>
import LineChart from './lineCharts'
export default {
  name: 'Search',
  components: { LineChart },
  data() {
    return {
      tableData: [{}]
    }
  }
}
</script>

<style scoped>
.search-header {
  display: flex;
  justify-content: space-between;
}
.pagination {
  float: right;
}
</style>
