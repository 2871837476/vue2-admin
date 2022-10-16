<template>
  <div>
    <el-row :gutter="30">
      <el-col :span="12">
        <Search />
      </el-col>
      <el-col :span="12">
        <Category />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Search from './Search/index.vue'
import Category from './Category/index.vue'
export default {
  name: 'Observe',
  components: { Search, Category }
}
</script>

<style>
</style>
