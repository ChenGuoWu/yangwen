<template>
	<div class="home">z
		<div class="header">
			<div class="header_title">
				<img src="@/assets/img/tab_logo.png" alt="">
				<span>技术规章后台管理信息系统</span>
			</div>
			<div class="sign_box">
				<img class="user_img" src="@/assets/img/yonghu.png" alt="">
				<el-dropdown trigger="click" @command="handleCommand">
					<span class="el-dropdown-link">
						<span style="cursor: pointer;">{{userInfo.userName}}</span><i class="el-icon-arrow-down el-icon--right"></i>
					</span>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command='2'>我的关注</el-dropdown-item>
						<el-dropdown-item command='3'>修改密码</el-dropdown-item>
						<el-dropdown-item command='4'>退出登录</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</div>
		</div>
		<div class="container">
			<div class="router_box">
				<div class="header"></div>
				<div class="router_content">
					<router-menu v-if="userInfo['userRole']"></router-menu>
				</div>
			</div>
			<div class="content_box">
				<div class="crumbs">
					<el-breadcrumb separator-class="el-icon-arrow-right">
					  <el-breadcrumb-item v-for="(item, index) in crumbsList" :key="index">{{item}}</el-breadcrumb-item>
					</el-breadcrumb>
				</div>
				<div class="content_container">
					<router-view v-if="isRoutreAlive"></router-view>
				</div>
			</div>
		</div>
		<div class="footer">
			<div class="link_box">
				<div class="link_item" v-for="(item, index) in linkList" :key="index">
					<img src="@/assets/img/lianj.png" alt="">
					<span>{{item.content}}</span>
				</div>
			</div>
			<div class="copyright_info">
				<span>Copyright © 2020 All right reserved 技术规章管理信息系统</span>
				<span>中国铁道科学研究院集团有限公司运输及经济研究所</span>
				<span> 电话：010-51893156</span>
			</div>
		</div>
	</div>
</template>

<script>
	// @ is an alias to /src
	import routerMenu from './components/routerMenu.vue'
	import {Base64} from '../util/util.js';
	export default {
		name: 'Home',
		provide() {
			return {
				reload: this.reload
			}
		},
		components: {
			routerMenu
		},
		data() {
			return {
				linkList: [{ //链接数组
					content: '法律法规',
					address: ''
				}, {
					content: '技术标准',
					address: ''
				}, {
					content: '建设标准',
					address: ''
				}, {
					content: '管理制度',
					address: ''
				}, {
					content: '计量管理',
					address: ''
				}],
				userInfo: {}, //用户信息
				crumbsList:[],  //面包屑展示数据
				isRoutreAlive: true,  //是否重新刷新局部页面
			}
		},
		created() {
			this.getUserInfo();
			this.userInfo = sessionStorage.getItem('userInfo') ? JSON.parse(sessionStorage.getItem('userInfo')) : '';
		},
		methods: {
			//从地址栏获取用户id
			getUserInfo(){
				// 获取用户信息
				let query = window.location.href;
				let queryStr = query.split("?");
				for (let i=0;i<queryStr.length;i++) {
					let pair = queryStr[i].split("=");
					if(pair[0] == 'pass'){
						this.userId = Base64.decode(pair[1].replace('%3D', '='));
					}
				}
				if(this.userId){
					let data = new FormData();
					data.append('id', this.userId);
					this.$http.post('/rule/users/getUserById', data,{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}).then(res => {
						if(res.code === 1){
							sessionStorage.setItem('userInfo', JSON.stringify(res.data));
							this.userInfo = res.data;
						}else{
							this.$router.push({path: '/404'});
						}
					}).catch(err => {
						console.log(err);
					})
				}
			},
			//下拉菜单点击触发事件
			handleCommand(command) {

			},
			//点击目录时记录面包屑
			clickMenu(index, name){
				if(index === 0){
					this.crumbsList.splice(0, 2);
				}
				if(index === 1){
					this.crumbsList.splice(1, 1);
				}
				this.$set(this.crumbsList, index, name);
			},
			//初始化页面时获取当前面包屑
			getCurrentCrumbs(list){
				this.crumbsList = [...list];
				this.$forceUpdate();
			},
			//重新加载
			reload() {
				this.isRoutreAlive = false;
				this.$nextTick(() => {
					this.isRoutreAlive = true;
				})
			},
		},
		watch:{}
	}
</script>
<style lang="scss" scoped="scoped">
	.header{
		height: 100px;
		width: 100%;
		background: url(../assets/img/tab_bg.png) no-repeat;
		position: relative;
		.header_title {
			letter-spacing: 2px;
			color: white;
			font-size: 38px;
			height: 56px;
			line-height: 56px;
			img {
				width: 68px;
				height: 56px;
				position: absolute;
				left: 113px;
				top: 23px;
			}
			span {
				position: absolute;
				left: 190px;
				top: 50%;
				transform: translateY(-50%);
			}
		}
		.sign_box {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			right: 140px;
			height: 30px;
			line-height: 30px;
			display: flex;
			align-items: center;
			.user_img {
				height: 30px;
				width: 30px;
				margin-right: 16px;
			}
			span {
				color: white;
			}
			.bottom_triangle {
				margin-left: 8px;
				width: 0;
				height: 0;
				border-right: 6px solid transparent;
				border-left: 6px solid transparent;
				border-top: 6px solid white;
				cursor: pointer;
			}
			.top_triangle {
				margin-left: 8px;
				width: 0;
				height: 0;
				border-right: 6px solid transparent;
				border-left: 6px solid transparent;
				border-bottom: 6px solid white;
			}
		}
	}
	.container{
		background: #F4F7FC;
		height: 832px;
		padding-top: 20px;
		.router_box{
			height: 710px;
			width: 12%;
			margin-right: 20px;
			margin-left: 60px;
			box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
			border-radius: 10px;
			background: #ffffff;
			float: left;
			.router_content{
				height: 697px;
				overflow-y: auto;
				&::-webkit-scrollbar {
					display: none;
				}
			}
			.header{
				width: 100%;
				height: 12px;
				background: #034799;
			}
		}
		.content_box{
			float: left;
			width: 80.66%;
			.content_container{
				margin-top: 13px;
				height: 706px;
			}
		}
	}
	.footer{
		height: 131px;
		background: url(../assets/img/lj_bg.png) no-repeat;
		position: relative;
		clear: both;

		.link_box {
			position: absolute;
			top: 20px;
			left: 50%;
			transform: translateX(-50%);
			width: 900px;
			.link_item {
				width: 160px;
				height: 40px;
				background-color: rgba($color: #ffffff, $alpha: 0.2);
				color: #ffffff;
				border-radius: 20px;
				float: left;
				margin: 0 10px;
				display: flex;
				align-items: center;
				cursor: pointer;

				img {
					height: 15px;
					width: 15px;
					margin-left: 36px;
					margin-right: 5px;
				}
			}
		}

		.copyright_info {
			font-size: 12px;
			color: #ffffff;
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			bottom: 7px;
			width: 847px;
			span {
				display: inline-block;
				margin-right: 41px;
			}
		}
	}
</style>
