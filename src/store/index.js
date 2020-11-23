import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
	isAddRoute: false,  //本地路由需要触发改变面包屑
  },
  mutations: {
	changeIsAddRoute(state, type){
		state.isAddRoute = type;
	}
  },
  actions: {
    changeIsAddRoute(context, type){
		context.commit('changeIsAddRoute', type);
    }
  },
  modules: {
  }
})
