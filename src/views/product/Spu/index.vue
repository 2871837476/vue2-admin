<template>
  <div>
    <el-card style="margin: 20px 0">
      <CategorySelect :show="scene===0" @getCategoryId="getCategoryId" />
    </el-card>
    <el-card>
      <!-- 底部这里将来有三部分进行切换 -->
      <!-- 展示Spu列表的结构 -->
      <div v-show="scene===0">
        <el-button type="primary" icon="el-icon-plus" :disabled="!category3Id" @click="addSpu">添加Spu</el-button>
        <el-table border style="margin-top:20px" :data="records">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="spuName" label="spu名称" />
          <el-table-column prop="description" label="spu描述" />
          <el-table-column prop="prop" label="操作">
            <template slot-scope="{row, $index}">
              <el-button
                type="primary"
                icon="el-icon-plus"
                size="mini"
                title="添加sku"
                @click="addSku(row)"
              />
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改spu"
                @click="updateSpu(row)"
              />
              <el-button
                type="info"
                icon="el-icon-info"
                size="mini"
                title="查看当前spu全部sku列表"
                @click="showSkuList(row)"
              />
              <el-popconfirm :title="`确认删除${row.spuName}吗？}`" @onConfirm="deleteSpu(row)">
                <el-button
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  title="删除spu"
                  style="margin-left: 10px"
                />
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align:center"
          :current-page="page"
          :page-size="limit"
          :page-sizes="[3, 5, 10]"
          layout="prev, pager, next, jumper, ->, sizes,  total"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
      <!-- 展示Spu表单的结构 -->
      <SpuForm v-show="scene===1" ref="spu" @changeScene="changeScene" />
      <!-- 展示Sku表单的结构 -->
      <SkuForm v-show="scene===2" ref="sku" @skuChangeScene="skuChangeScene" />
    </el-card>
    <!-- 展示sku列表的对话框 -->
    <el-dialog
      :title="`${spu.spuName}的sku列表`"
      :visible.sync="dialogTableVisible"
      :before-close="closeDialog"
    >
      <el-table v-loading="loading" :data="skuList" border style="width: 100%">
        <el-table-column prop="skuName" label="名称" width="width" />
        <el-table-column prop="price" label="价格" width="100px" />
        <el-table-column prop="weight" label="重量" width="100px" />
        <el-table-column label="默认图片" width="120px">
          <template slot-scope="{row, $index}">
            <img :src="row.skuDefaultImg" style="width:100px;height:100px" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SpuForm from './SpuForm'
import SkuForm from './SkuForm'
export default {
  name: 'Spu',
  components: {
    SpuForm,
    SkuForm
  },
  data() {
    return {
      category1Id: '',
      category2Id: '',
      category3Id: '',
      page: 1, // 当前第几页
      limit: 3, // 每页显示多少条
      total: 0, // 分页器一共展示多少条数据
      records: [], // spu列表数据
      scene: 0, // 控制展示哪部分(0表示展示spu列表;1表示展示spu表单结构;2表示展示sku表单结构)
      dialogTableVisible: false, // 控制展示sku列表的对话框的显示与隐藏
      spu: {}, // 保存当前spu的信息
      skuList: [], // 保存获取到的当前spu的全部sku列表数据
      loading: true
    }
  },
  methods: {
    // 三级联动的自定义事件，可以把子组件相应三个级别的分类的id传递给父组件，发送请求展示数据
    getCategoryId({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId
      } else if (level === 2) {
        this.category2Id = categoryId
      } else {
        this.category3Id = categoryId
        // 发送请求，获取数据
        this.getSpuList()
      }
    },
    // 获取spu列表的数据
    async getSpuList(pager = 1) {
      this.page = pager
      const { page, limit, category3Id } = this
      const result = await this.$API.spu.reqSpuList(page, limit, category3Id)
      if (result.code === 200) {
        this.total = result.data.total
        this.records = result.data.records
      }
    },
    // 当前页码变化,获取对应新页码数据
    handleCurrentChange(currentPage) {
      this.getSpuList(currentPage)
    },
    // 每页展示数据条数变化,获取对应数量数据进行展示
    handleSizeChange(currentLimit) {
      this.limit = currentLimit
      this.getSpuList()
    },
    // 添加Spu的回调
    addSpu() {
      this.scene = 1
      // 通知子组件SpuForm发请求：两个（获取品牌的数据、获取销售属性）
      this.$refs.spu.addSpuData(this.category3Id)
    },
    // 修改Spu的回调
    updateSpu(row) {
      this.changeScene({ scene: 1 })
      // 调用子组件SpuForm中的方法:发四个请求
      this.$refs.spu.initSpuData(row)
    },
    // 自定义事件changeScene的回调
    changeScene({ scene, flag }) {
      this.scene = scene
      // 修改spu/添加spu的页面保存成功后，跳转到展示spu列表的页面时，要重新发送请求，展示最新的spu列表
      if (flag === '修改') {
        // 如果从修改spu完成返回展示列表页面,则应该展示点击"修改Spu"时的页码的数据
        this.getSpuList(this.page)
      } else {
        // 如果从添加spu完成返回展示列表页面,则应该展示第一页
        this.getSpuList()
      }
    },
    // SkuForm切换场景的自定义事件的回调
    skuChangeScene(scene) {
      this.scene = scene
    },
    // 删除Spu
    async deleteSpu(row) {
      const result = await this.$API.spu.reqDeleteSpu(row.id)
      if (result.code === 200) {
        this.$message({
          type: 'success',
          message: '删除成功'
        })
        this.getSpuList(this.records.length > 1 ? this.page : this.page - 1)
      }
    },
    // 添加Sku
    addSku(row) {
      this.changeScene({ scene: 2 })
      // 调用子组件SkuForm中的方法:发3个请求
      this.$refs.sku.getData(this.category1Id, this.category2Id, row)
    },
    // 查看sku列表
    async showSkuList(spu) {
      // 展示sku列表
      this.dialogTableVisible = true
      // 保存当前spu的信息
      this.spu = spu
      // 发请求，获取sku列表的数据
      const result = await this.$API.spu.reqSkuList(spu.id)
      if (result.code === 200) {
        this.skuList = result.data
        // 请求完成，取消loading效果
        this.loading = false
      }
    },
    // 关闭对话框之前的回调
    closeDialog(done) {
      this.loading = true
      this.skuList = []
      // 关闭对话框
      done()
    }
  }
}
</script>

<style>
</style>
