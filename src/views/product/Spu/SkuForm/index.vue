<template>
  <div>
    <el-form ref="form" label-width="100px">
      <el-form-item label="SPU名称">{{ spu.spuName }}</el-form-item>
      <el-form-item label="SKU名称">
        <el-input v-model="skuInfo.skuName" placeholder="sku名称" />
      </el-form-item>
      <el-form-item label="价格（元）">
        <el-input v-model="skuInfo.price" placeholder="价格（元）" type="number" />
      </el-form-item>
      <el-form-item label="重量（千克）">
        <el-input v-model="skuInfo.weight" placeholder="重量（千克）" />
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input v-model="skuInfo.skuDesc" type="textarea" rows="4" />
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form ref="form" :inline="true" label="width: 80px">
          <el-form-item v-for="attr in attrInfoList" :key="attr.id" :label="attr.attrName">
            <!-- select中v-model收集到的是option的value值，放在attr.attrIdAndValueId上 -->
            <el-select v-model="attr.attrIdAndValueId" placeholder="请选择">
              <!-- 需要收集的是平台属性的id和选中属性值的id -->
              <el-option
                v-for="attrValue in attr.attrValueList"
                :key="attrValue.id"
                :label="attrValue.valueName"
                :value="`${attr.id}:${attrValue.id}`"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form ref="form" :inline="true" label="width: 80px">
          <el-form-item
            v-for="saleAttr in spuSaleAttrList"
            :key="saleAttr.id"
            :label="saleAttr.saleAttrName"
          >
            <el-select v-model="saleAttr.attrIdAndValueId" placeholder="请选择">
              <el-option
                v-for="saleAttrValue in saleAttr.spuSaleAttrValueList"
                :key="saleAttrValue.id"
                :label="saleAttrValue.saleAttrValueName"
                :value="`${saleAttr.id}:${saleAttrValue.id}`"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表">
        <el-table
          style="width: 100%"
          border
          :data="spuImageList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column width="80" type="selection" />/>
          <el-table-column label="图片">
            <template slot-scope="{row, $index}">
              <img :src="row.imgUrl" style="width:100px;height:100px" />
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="imgName" />
          <el-table-column label="操作">
            <template slot-scope="{row, $index}">
              <el-button v-if="row.isDefault == 0" type="primary" @click="changeDefault(row)">设为默认</el-button>
              <el-button v-else>默认</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SkuForm',
  data() {
    return {
      // 存储平台属性的数据
      attrInfoList: [],
      // 存储销售是属性
      spuSaleAttrList: [],
      // 存储图片的信息
      spuImageList: [],
      // 存储父组件传来的spu信息
      spu: {},
      // 收集Sku数据的字段
      skuInfo: {
        // 第一类：父组件给的数据
        category3Id: 0,
        spuId: 0,
        tmId: 0,
        // 第二类：需要通过数据双向绑定v-model收集的
        skuName: '',
        price: 0,
        weight: '',
        skuDesc: '', // 规格描述
        // 第三类：需要自己书写代码的
        // 收集图片的字段
        skuImageList: [],
        // 默认图片的url
        skuDefaultImg: '',
        // 平台属性的字段
        skuAttrValueList: [],
        // 销售属性的字段
        skuSaleAttrValueList: []
      },
      // 临时存储选择图片的信息
      imageList: []
    }
  },
  methods: {
    // 获取SkuForm数据
    async getData(category1Id, category2Id, spu) {
      // 收集父组件给予的数据
      this.skuInfo.category3Id = spu.category3Id
      this.skuInfo.spuId = spu.id
      this.skuInfo.tmId = spu.tmId
      this.spu = spu
      // 获取平台属性的数据
      const result1 = await this.$API.spu.reqAttrInfoList(
        category1Id,
        category2Id,
        spu.category3Id
      )
      if (result1.code === 200) {
        this.attrInfoList = result1.data
      }
      // 获取销售属性的数据
      const result2 = await this.$API.spu.reqSpuSaleAttrList(spu.id)
      if (result2.code === 200) {
        this.spuSaleAttrList = result2.data
      }
      // 获取图片的数据
      const result3 = await this.$API.spu.reqSpuImageList(spu.id)
      if (result3.code === 200) {
        const list = result3.data
        // 给服务器返回的图片信息中添加isDefault字段，默认都为0
        list.forEach((item) => {
          item.isDefault = 0
        })
        this.spuImageList = list
      }
    },
    // 图片列表的table表格复选框按钮的事件
    handleSelectionChange(value) {
      // value是一个数组，里面每一个元素都是一个对象，每个对象是当前被勾选的图片信息
      // 用一个临时的数组保存被选中的图片信息（因为还缺少isDefault字段）
      this.imageList = value
    },
    // 选择默认图片：排他思想
    changeDefault(row) {
      this.spuImageList.forEach((item) => {
        item.isDefault = 0
      })
      // 设为默认图片
      row.isDefault = 1
      // 收集默认图片的地址
      this.skuInfo.skuDefaultImg = row.imgUrl
    },
    // 点击“取消”的回调
    cancel() {
      // 切换场景
      this.$emit('skuChangeScene', 0)
      // 清除数据
      Object.assign(this._data, this.$options.data())
    },
    // 点击“保存”的回调
    async save() {
      const { attrInfoList, spuSaleAttrList, imageList, skuInfo } = this
      // 整理平台属性
      skuInfo.skuAttrValueList = attrInfoList.reduce((prev, item) => {
        if (item.attrIdAndValueId) {
          const [attrId, valueId] = item.attrIdAndValueId.split(':')
          prev.push({ attrId, valueId })
        }
        return prev
      }, [])
      // 整理销售属性
      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((prev, item) => {
        if (item.attrIdAndValueId) {
          const [saleAttrId, saleAttrValueId] = item.attrIdAndValueId.split(':')
          prev.push({ saleAttrId, saleAttrValueId })
        }
        return prev
      }, [])
      // 整理图片的数据
      skuInfo.skuImageList = imageList.map((item) => {
        return {
          imgName: item.imgName,
          imgUrl: item.imgUrl,
          isDefault: item.isDefault,
          spuImgId: item.id
        }
      })
      // 发请求
      const result = await this.$API.spu.reqAddSku(skuInfo)
      if (result.code === 200) {
        this.$message({ type: 'success', message: '添加SKU成功' })
        this.$emit('skuChangeScene', 0)
      }
      // 清除数据
      Object.assign(this._data, this.$options.data())
    }
  }
}
</script>

<style>
</style>
