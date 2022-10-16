<template>
  <div>
    <el-card style="margin: 20px 0">
      <CategorySelect :show="isShowTable" @getCategoryId="getCategoryId" />
    </el-card>
    <el-card>
      <!-- 表格展示属性 -->
      <div v-show="isShowTable">
        <el-button
          v-has="'btn.Attr.add'"
          type="primary"
          icon="el-icon-plus"
          style="margin: 0 0 20px 0"
          :disabled="!category3Id"
          @click="addAttr"
        >添加属性</el-button>
        <el-table border style="width: 100%" :data="attrList">
          <el-table-column label="序号" width="80" align="center" type="index" />
          <el-table-column prop="attrName" label="属性名称" width="150" />
          <el-table-column label="属性值列表">
            <template slot-scope="{ row }">
              <el-tag
                v-for="attrValue in row.attrValueList"
                :key="attrValue.id"
                type="success"
                style="margin: 0px 10px"
              >{{ attrValue.valueName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="{ row }">
              <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateAttr(row)">修改</el-button>
              <el-popconfirm :title="`确定删除${row.attrName}吗？`" @onConfirm="deleteAttr(row)">
                <el-button
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  style="margin: 0px 10px"
                >删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加/修改属性的结构 -->
      <div v-show="!isShowTable">
        <!-- 属性名 -->
        <el-form ref="form" label-width="80px" :inline="true" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input v-model="attrInfo.attrName" placeholder="请输入属性名" />
          </el-form-item>
        </el-form>
        <!-- 添加/取消添加属性值 -->
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attrInfo.attrName.trim()"
          @click="addAttrValue"
        >添加属性值</el-button>
        <el-button @click="isShowTable = true">取消</el-button>
        <!-- 属性值 -->
        <el-table border style="width:100%; margin: 20px 0;" :data="attrInfo.attrValueList">
          <el-table-column label="序号" width="80" align="center" type="index" />
          <el-table-column prop="prop" label="属性值">
            <template slot-scope="{ row, $index }">
              <el-input
                v-if="row.flag"
                :ref="$index"
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                @blur="toLook(row)"
                @keyup.native.enter="toLook(row)"
              />
              <span v-else style="display: block" @click="toEdit(row, $index)">{{ row.valueName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作">
            <template slot-scope="{ row, $index }">
              <el-popconfirm :title="`确定删除${row.valueName}吗？`" @onConfirm="deleteAttrValue($index)">
                <el-button slot="reference" type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          :disabled="attrInfo.attrValueList.length<1"
          @click="addOrUpdateAttr"
        >保存</el-button>
        <el-button @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
// 按需引入lodash当中的深拷贝
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'Attr',
  data() {
    return {
      category1Id: '',
      category2Id: '',
      category3Id: '',
      // 平台属性的数据
      attrList: [],
      // 控制table的显示与隐藏
      isShowTable: true,
      // 收集新增属性/修改属性使用的
      attrInfo: {
        attrName: '', // 属性名
        attrValueList: [], // 属性值的数组
        categoryId: 0,
        categoryLevel: 3
      }
    }
  },
  methods: {
    // 自定义事件的回调：拿到三个级别的id，发送请求
    getCategoryId({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId
      } else if (level === 2) {
        this.category2Id = categoryId
      } else {
        this.category3Id = categoryId
        // 三个级别的分类id都拿到了，发送请求，获取平台的属性数据
        this.getAttrList()
      }
    },
    // 获取平台属性的数据
    async getAttrList() {
      const { category1Id, category2Id, category3Id } = this
      const result = await this.$API.attr.reqAttrList(
        category1Id,
        category2Id,
        category3Id
      )
      if (result.code === 200) {
        this.attrList = result.data
      }
    },
    // 添加属性值的回调
    addAttrValue() {
      // 向属性值的数组中添加元素
      this.attrInfo.attrValueList.push({
        // attrId:为相应属性的id（如果没有则值为undefined）
        attrId: this.attrInfo.id,
        valueName: '',
        // 用于标记用户切换查看模式与编辑模式，好处是每一个属性值都可以独立控制自己的模式切换
        flag: true
      })
      // 点击添加属性值，自动获取输入框的焦点
      this.$nextTick(() => {
        this.$refs[this.attrInfo.attrValueList.length - 1].focus()
      })
    },
    // 添加属性的回调
    addAttr() {
      // 控制table隐藏
      this.isShowTable = false
      this.attrInfo = {
        attrName: '', // 属性名
        attrValueList: [], // 属性值的数组
        categoryId: this.category3Id, // 顺便获取三级分类的id,后续发送添加/修改属性的请求要用
        categoryLevel: 3
      }
    },
    // 修改属性的回调
    updateAttr(row) {
      // 控制table隐藏
      this.isShowTable = false
      // row:是被修改的属性的有关信息,将row深拷贝给attrInfo
      this.attrInfo = cloneDeep(row)
      // 在修改某一个属性时,将相应的属性值元素添加上flag标记,用于标识查看模式与编辑模式
      this.attrInfo.attrValueList.forEach((item) => {
        this.$set(item, 'flag', false)
      })
    },
    // 失去焦点的事件，切换为查看模式（显示span）
    toLook(row) {
      // row是新增的属性值，是数组中的最后一个元素,其携带了该属性值的相关信息(如attrId,valueName,flag)
      if (row.valueName.trim() === '') {
        // 用户输入的属性值为空,则提示用户输入正常的属性值
        this.$message({
          type: 'warning',
          message: '请输入一个正常的属性值!'
        })
        return
      }
      // 判断新增的属性值是否与原有属性值重复
      const isRepeat = this.attrInfo.attrValueList.some((item) => {
        // 新增的属性值row是数组的最后一个元素,在判断是否重复时应该排除在外(避免自己与自己比较,那一定为true)
        if (row !== item) {
          return row.valueName === item.valueName
        }
      })
      if (isRepeat) {
        this.$message({
          message: '不允许输入重复的属性值',
          type: 'error'
        })
        return
      }
      row.flag = false
    },
    // 点击span的回调，切换为编辑模式（显示input输入框）
    toEdit(row, index) {
      // 切换为编辑模式
      row.flag = true
      // 自动获取输入框的焦点
      this.$nextTick(() => {
        this.$refs[index].focus()
      })
    },
    // 气泡确认框的确定按钮的回调
    deleteAttrValue(index) {
      // 当前删除属性值的操作是不需要发请求的
      this.attrInfo.attrValueList.splice(index, 1)
    },
    // 保存按钮：进行添加属性或修改属性的操作
    async addOrUpdateAttr() {
      // 整理参数：删除属性值为空的元素；去掉flag字段
      this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter(
        (item) => {
          if (item.valueName !== '') {
            delete item.flag
            return true
          }
        }
      )
      try {
        // 发送请求，通知服务器添加/修改属性
        await this.$API.attr.reqAddOrUpdateAttr(this.attrInfo)
        // 显示table
        this.isShowTable = true
        // 提示保存成功
        this.$message({
          type: 'success',
          message: '保存成功'
        })
        // 保存成功后要重新发送请求，获取最新的平台属性的数据进行展示
        this.getAttrList()
      } catch {
        // 保存失败，提示
        this.$message({ type: 'error', message: '保存失败' })
      }
    },
    // 删除属性
    async deleteAttr(row) {
      try {
        await this.$API.attr.reqDeleteAttr(row.id)
        this.$message({ type: 'success', message: '删除成功' })
        // 重新获取属性进行展示
        this.getAttrList()
      } catch (error) {
        this.$message({ type: 'error', message: '删除失败' })
      }
    }
  }
}
</script>

<style>
</style>
