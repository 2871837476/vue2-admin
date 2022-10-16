<template>
  <div>
    <el-form label-width="80px" :model="spu">
      <el-form-item label="SPU名称">
        <el-input v-model="spu.spuName" placeholder="SPU名称" />
      </el-form-item>
      <el-form-item label="品牌">
        <el-select v-model="spu.tmId" placeholder="请选择品牌">
          <el-option v-for="tm in tradeMarkList" :key="tm.id" :label="tm.tmName" :value="tm.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input v-model="spu.description" type="textarea" rows="4" placeholder="SPU描述" />
      </el-form-item>
      <el-form-item>
        <!--
          list-type:文件列表的类型，picture-card表示照片墙
          file-list：上传的文件列表，注意数组中元素必须有name、url
        -->
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :file-list="spuImageList"
        >
          <i class="el-icon-plus" />
        </el-upload>
        <!-- 图片的预览(放大版) -->
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select v-model="attrIdAndattrName" :placeholder="`还有${unSelectSaleAttr.length}个未选择`">
          <el-option
            v-for="unSelect in unSelectSaleAttr"
            :key="unSelect.id"
            :label="unSelect.name"
            :value="`${unSelect.id}:${unSelect.name}`"
          />
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          style="margin-left: 10px"
          :disabled="!attrIdAndattrName"
          @click="addSaleAttr"
        >添加销售属性</el-button>
        <el-table style="width: 100%; margin-top: 20px;" border :data="spu.spuSaleAttrList">
          <el-table-column type="index" label="序号" width="80px" align="center" />
          <el-table-column prop="saleAttrName" label="属性名" width="width" />
          <el-table-column prop="prop" label="属性值名称列表" width="width">
            <template slot-scope="{row, $index}">
              <el-tag
                v-for="(tag, index) in row.spuSaleAttrValueList"
                :key="tag.id"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
              >{{ tag.saleAttrValueName }}</el-tag>
              <!-- 这里相当于input和button的切换 -->
              <el-input
                v-if="row.inputVisible"
                ref="saveTagInput"
                v-model="row.inputValue"
                class="input-new-tag"
                size="small"
                @blur="handleInputConfirm(row)"
              />
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="addSaleAttrValue(row)"
              >添加</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{row, $index}">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="spu.spuSaleAttrList.splice($index, 1)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateSpu">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SpuForm',
  data() {
    return {
      // 预览图的地址
      dialogImageUrl: '',
      // 控制预览大图对话框的显示与隐藏
      dialogVisible: false,
      spu: {
        // spu名称
        spuName: '',
        // 品牌描述
        description: '',
        // 三级分类的id
        category3Id: 0,
        // 品牌的id
        tmId: '',
        // 平台属性与属性值
        spuSaleAttrList: [],
        // 收集spu图片的信息
        spuImageList: []
      }, // 存储SPU信息属性
      tradeMarkList: [], // 存储品牌信息
      spuImageList: [], // 收集spu图片的信息
      saleAttrList: [], // 平台销售属性的数据(一共就是三个)
      attrIdAndattrName: '' // 收集下拉框选择的销售属性的id和属性名
    }
  },
  computed: {
    // 计算出还未选择的销售属性
    unSelectSaleAttr() {
      const result = this.saleAttrList.filter((item) => {
        return this.spu.spuSaleAttrList.every((item1) => {
          return item.name !== item1.saleAttrName
        })
      })
      return result
    }
  },
  methods: {
    // 照片墙图片预览的函数
    handlePictureCardPreview(file) {
      // 预览图的地址
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    // 照片墙删除图片时触发的函数
    handleRemove(file, fileList) {
      // file:删除的图片的信息; fileList:剩余的图片的信息
      this.spuImageList = fileList
    },
    // 照片墙图片上传成功的函数
    handleSuccess(response, file, fileList) {
      this.spuImageList = fileList
    },
    // 点击取消按钮的回调
    cancel() {
      // 切换场景，回到展示列表页面
      this.$emit('changeScene', { scene: 0, flag: '' })
      // 清理数据
      Object.assign(this._data, this.$options.data())
    },
    // 点击修改Spu时，初始化SpuForm数据
    async initSpuData(spu) {
      // 获取spu信息的数据
      const spuResult = await this.$API.spu.reqSpu(spu.id)
      if (spuResult.code === 200) {
        this.spu = spuResult.data
      }
      // 获取品牌的信息
      const tradeMarkResult = await this.$API.spu.reqTradeMarkList()
      if (tradeMarkResult.code === 200) {
        this.tradeMarkList = tradeMarkResult.data
      }
      // 获取spu图片的数据
      const spuImageResult = await this.$API.spu.reqSpuImageList(spu.id)
      if (spuImageResult.code === 200) {
        const listArr = spuImageResult.data
        // 照片墙显示图片的数据需要数组，并且数组中的元素需要有name与url字段，需要对服务器返回的数据进行修改
        listArr.forEach((item) => {
          item.name = item.imgName
          item.url = item.imgUrl
        })
        this.spuImageList = listArr
      }
      // 获取平台全部的销售属性
      const saleResult = await this.$API.spu.reqBaseSaleAttrList()
      if (saleResult.code === 200) {
        this.saleAttrList = saleResult.data
      }
    },
    // 添加新的销售属性
    addSaleAttr() {
      // 分割下拉框收集到的数据
      const [baseSaleAttrId, saleAttrName] = this.attrIdAndattrName.split(':')
      // 向spu.spuSaleAttrList里面添加新的销售属性信息
      this.spu.spuSaleAttrList.push({
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: []
      })
      // 添加完成后，清空attrIdAndattrName
      this.attrIdAndattrName = ''
    },
    // 添加新的销售属性值
    addSaleAttrValue(row) {
      // 点击销售属性值中的添加按钮，由button变为input（通过当前销售属性的inputVisible进行控制）
      // 销售属性中尚未有inputVisible，需要手动添加（响应式的）
      this.$set(row, 'inputVisible', true)
      // 添加响应式数据inputValue字段，用于收集input输入框中输入的新增属性值
      this.$set(row, 'inputValue', '')
    },
    // 添加属性值的输入框失去焦点的操作
    handleInputConfirm(row) {
      // 解构出属性id和新增的属性值
      const { baseSaleAttrId, inputValue } = row
      // 输入的属性值不能为空
      if (inputValue.trim() === '') {
        this.$message({
          type: 'error',
          message: '属性值不能为空'
        })
        return
      }
      // 输入的属性值不能重复
      const isRepeat = row.spuSaleAttrValueList.some(
        (item) => item.saleAttrValueName === inputValue.trim()
      )
      if (isRepeat) {
        this.$message({
          type: 'error',
          message: '属性值不能重复'
        })
        return
      }
      // 新增的销售属性值的信息
      const newSaleAttrValue = {
        baseSaleAttrId,
        saleAttrValueName: inputValue.trim()
      }
      // 将新增的销售属性值添加到销售属性值列表中
      row.spuSaleAttrValueList.push(newSaleAttrValue)
      // input变为button
      row.inputVisible = false
    },
    // 保存按钮的回调：添加Spu/修改Spu
    async addOrUpdateSpu() {
      // 整理照片墙的参数：从服务器获取到的图片是有imgName、imgUrl字段的（也有name、url字段），而自己新增的是只有name、url字段（因为照片墙展示图片属性名必须为这两个），而且新增的url地址是本地的地址，应该使用上传成功的response.data中的地址
      this.spu.spuImageList = this.spuImageList.map((item) => {
        return {
          imgName: item.name,
          imgUrl: (item.response && item.response.data) || item.url
        }
      })
      const result = await this.$API.spu.reqAddOrUpdateSpu(this.spu)
      if (result.code === 200) {
        this.$message({
          type: 'success',
          message: '保存成功'
        })
        // 回到展示spu列表页面
        this.$emit('changeScene', {
          scene: 0,
          flag: this.spu.id ? '修改' : '保存' // 用于标识是添加spu完成返回到展示列表页面,还是修改Spu完成返回到展示列表页面
        })
        // 清理数据
        Object.assign(this._data, this.$options.data())
      }
    },
    // 点击“添加Spu”按钮时，发请求的函数
    async addSpuData(category3Id) {
      // 收集三级分类的id
      this.spu.category3Id = category3Id
      // 获取品牌的信息
      const tradeMarkResult = await this.$API.spu.reqTradeMarkList()
      if (tradeMarkResult.code === 200) {
        this.tradeMarkList = tradeMarkResult.data
      }
      // 获取平台全部的销售属性
      const saleResult = await this.$API.spu.reqBaseSaleAttrList()
      if (saleResult.code === 200) {
        this.saleAttrList = saleResult.data
      }
    }
  }
}
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
