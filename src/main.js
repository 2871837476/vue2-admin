import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
Vue.use(ElementUI, { locale })

// 引入相关API请求的接口
import API from '@/api'
Vue.prototype.$API = API

// 注册全局组件CategorySelect
import CategorySelect from '@/components/CategorySelect'
Vue.component(CategorySelect.name, CategorySelect)

// 全局注册自定义指令v-has
Vue.directive('has', {
  bind(el, bindings) {
    // 所有的按钮权限值
    const permissions = localStorage.getItem('buttons')
    // 当前按钮需要的权限
    const needPermission = bindings.value
    // 判断是否有该按钮的权限
    const isHas = permissions.includes(needPermission)
    if (!isHas) {
      // 隐藏当前按钮
      el.style.display = 'none'
      // 使用定时器,因为bind函数执行时还没有渲染DOM元素
      setTimeout(() => {
        // 删除按钮的DOM元素
        el.parentNode.removeChild(el)
      }, 0)
    }
  }
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
