<template>
  <div>
    <!-- 按钮 -->
    <el-button type="primary" icon="el-icon-plus" style="margin: 10px 0px" @click="showDialog">添加</el-button>
    <!-- 表格 -->
    <!--
      表格组件
      data:表格组件将来需要展示的数据------数组类型
      border：是给表格添加边框
      column属性
      label：显示标题
      width：对应列的宽度
      align：标题的对齐方式
      prop:对应列内容的字段名
      注意1：elmentUI当中的table组件，展示的数据是以一列一列进行展示数据
    -->
    <el-table style="width: 100%" border :data="list">
      <el-table-column prop="prop" label="序号" width="80" align="center" type="index" />
      <el-table-column prop="tmName" label="品牌名称" />
      <el-table-column prop="logoUrl" label="品牌LOGO">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt style="width: 80px; height: 80px" />
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作">
        <template slot-scope="{ row, $index }">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateTradeMark(row)">修改</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTradeMark(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <!--
      current-page:代表的是当前第几页
      total：代表分页器一共需要展示数据条数
      page-size：代表的是每一页需要展示多少条数据
      page-sizes：代表可以设置每一页展示多少条数据
      layout：可以实现分页器布局
      pager-count:按钮的数量
      @size-change：页面显示数据条数发生变化时触发的事件
      @current-change：当前页码发生变化时触发的事件
    -->
    <el-pagination
      style="margin-top: 20px; textAlign: center"
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      :pager-count="7"
      layout="prev, pager, next, jumper, ->,sizes, total"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <!-- 对话框 -->
    <!-- :visible.sync：控制对话框的显示与隐藏 -->
    <el-dialog :title="tmForm.id ? '添加品牌' : '修改品牌'" :visible.sync="dialogFormVisible">
      <!-- form表单：model属性是表单数据对象，作用是把表单的数据收集到该对象上（将来表单验证也需要这个属性）-->
      <el-form ref="ruleForm" style="width: 80%" :model="tmForm" :rules="rules">
        <!-- 输入框 -->
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <!-- v-model收集品牌名称 -->
          <el-input v-model="tmForm.tmName" autocomplete="off" />
        </el-form-item>
        <!-- 上传图片 -->
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <!--
            action：设置图片上传的地址
            on-success：检测到图片上传成功，会执行一次函数
            before-upload：在上传图片之前执行一次函数
          -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <!-- 如果有上传图片，则显示图片，没有则显示加号 -->
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon" />
            <!-- 提示信息 -->
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TradeMark',
  data() {
    // 自定义校验规则
    var validateTmName = (rule, value, callback) => {
      if (value.trim().length < 2 || value.trim().length > 10) {
        callback(new Error('品牌名称应为2~10位'))
      } else {
        callback()
      }
    }
    return {
      // 当前第几页
      page: 1,
      // 一页展示几条数据
      limit: 3,
      // 数据的总条数
      total: 0,
      // 列表展示的数据
      list: [],
      // 控制对话框的显示与隐藏
      dialogFormVisible: false,
      // 收集品牌信息：对象身上的属性名不能乱写，需要与接口文档的参数对应
      tmForm: {
        tmName: '',
        logoUrl: ''
      },
      // 表单验证规则
      rules: {
        tmName: [
          // required:是否为必填；message：提示信息；trigger：用户行为设置（常用的有blur、change）
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          // 自定义校验规则
          {
            validator: validateTmName,
            trigger: 'change'
          }
        ],
        logoUrl: [
          // 上传图片不属于表单元素，因此trigger无效
          { required: true, message: '请选择品牌的图片' }
        ]
      }
    }
  },
  mounted() {
    this.getPageList()
  },
  methods: {
    // 获取品牌列表的数据
    async getPageList(pager = 1) {
      this.page = pager
      const { page, limit } = this
      const result = await this.$API.tradeMark.reqTradeMarkList(page, limit)
      if (result.code === 200) {
        // 获取展示数据的总条数
        this.total = result.data.total
        // 获取列表展示的数据
        this.list = result.data.records
      }
    },
    // 当前页码发生变化，展示对应页码的数据
    handleCurrentChange(currentPage) {
      this.getPageList(currentPage)
    },
    // 当前显示数据条数发生变化,重新展示对应条数的数据
    handleSizeChange(currentLimit) {
      this.limit = currentLimit
      this.getPageList()
    },
    // 点击“添加”按钮，显示对话框
    showDialog() {
      this.dialogFormVisible = true
      // 清除之前的数据
      this.tmForm = {
        tmName: '',
        logoUrl: ''
      }
    },
    // 点击“修改”按钮，修改某个品牌
    updateTradeMark(row) {
      // 显示对话框
      this.dialogFormVisible = true
      // 显示品牌名称、品牌logo（浅拷贝）
      this.tmForm = { ...row }
    },
    // 图片上传成功
    handleAvatarSuccess(res, file) {
      // res、file：是上传成功之后，返回给前端的数据
      // 收集品牌图片数据，将来带给服务器
      this.tmForm.logoUrl = res.data
    },
    // 图片上传之前,判断上传的图片类型和大小是否符合
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG && !isPNG) {
        this.$message.error('上传头像图片只能是 JPG或PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return (isJPG || isPNG) && isLt2M
    },
    // 点击“确定”，完成添加/修改品牌
    addOrUpdateTradeMark() {
      this.$refs.ruleForm.validate(async(valid) => {
        if (valid) {
          // 关闭对话框
          this.dialogFormVisible = false
          // 发请求，添加/修改品牌
          const result = await this.$API.tradeMark.reqAddOrUpdateTradeMark(
            this.tmForm
          )
          if (result.code === 200) {
            // 弹出信息：添加/修改品牌成功
            this.$message({
              message: this.tmForm.id ? '修改品牌成功' : '添加品牌成功',
              type: 'success'
            })
            // 添加/修改品牌成功后，再次获取品牌列表进行展示
            this.getPageList(this.tmForm.id ? this.page : 1)
          }
        } else {
          return false
        }
      })
    },
    // 删除品牌信息
    deleteTradeMark(row) {
      this.$confirm(`确定删除${row.tmName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const result = await this.$API.tradeMark.reqDeleteTradeMark(row.id)
          if (result.code === 200) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            // 删除品牌信息后,重新获取数据展示列表(如果当前页码的原有数据大于一条，则删除后仍展示当前页码的数据；如果当前页码的原有数据只有一条，则删除后展示上一页的数据)
            this.getPageList(this.list.length > 1 ? this.page : this.page - 1)
          }
        })
        .catch(() => {
          this.$message({
            // 用户点击取消按钮时会触发
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  }
}
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
