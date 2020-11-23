<template>
	<div class="menu">
		<div class="menu-item" :style="{paddingBottom: isActive.includes(item.id) ? '0px' : ' 0.225rem'}" v-for="(item, index) in listData" :key="item.id">
			<div :class="isActive.includes(item.id) ? 'item_box active_color' : 'item_box'" @click="clickMenu(0, item)">
				<img class="icon" :src="isActive.includes(item.id) ? item.routerActiveIcon : item.routerIcon" alt="">
				<span class="title">{{item.name}}</span>
				<span :class="isActive.includes(item.id) ? 'bottom_triangle' : 'right_triangle'"></span>
			</div>
			<div class="menu-children" v-if="isActive.includes(item.id)">
				<div class="menu-item-item" v-for="(items, index) in item.children" :key="items.id">
					<div :class="isActive.includes(items.id) ? 'active_color active_bg item_box' : 'item_box'" @click="clickMenu(1, items, $event)">
						<span>{{items.name}}</span>
						<span class="right_dian"></span>
					</div>
					<div class="three_menu" v-show="isActive.includes(items.id) && items.children && isActiveThree">
						<div class="menu_box">
							<div @click="clickMenu(2, itemss)" :class="isActive.includes(itemss.id) ? 'three_menu_item active_item' : 'three_menu_item'" v-for="(itemss, index) in items.children" :key="itemss.id">
								{{itemss.name}}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import {toTree} from '../../util/util.js'
	export default {
		inject: ['reload'],
		data(){
			return {
				listData: [],  //路由数据
				isActive: [],  //是否是当前路由
				isActiveThree: false,  //是否显示3级导航
				currentPath: '',  //当前路由路径
			}
		},
		computed:{
			isChange() {
			    return this.$store.state.isAddRoute;　　//需要监听的数据
			}
		},
		created() {
			this.init();
			this.currentPath = this.$route.path;
		},
		methods: {
			//获取导航目录数据
			init(){
				this.$http.get('/rule/user/get-user-permission', {
					userRole: this.$parent.userInfo.userRole
				}).then(res => {
					if(res.code == '1'){
						this.listData = toTree(res.data, 'id', 'parentId');
						if(this.$parent.userInfo.userRole == 1){
							let list = [{
									id: 9999,
									name: '一级组织机构',
									router: '/systemManage/organization'
								},{
									id: 9998,
									name: '多级组织机构',
									router: '/systemManage/organization'
								}],
								list2 = [{
									id: 9997,
									name: '一级规章分类',
									router: '/systemManage/ruleClassification'
								},{
									id: 9996,
									name: '多级规章分类',
									router: '/systemManage/ruleClassification'
								}];
							this.listData.forEach(item => {
								item.routerActiveIcon = require('../../assets/img/router_icon_' + item.id + '_active.png');
								item.routerIcon = require('../../assets/img/router_icon_' + item.id + '.png');
								if(item.id == 22){
									item.children.forEach(items => {
										if(items.id == 23){
										  items.children = list;
										}
										if(items.id == 24){
										  items.children = list2;
										}
									})
								}
							})
						}else{
							this.listData.forEach(item => {
								item.routerActiveIcon = require('../../assets/img/router_icon_' + item.id + '_active.png');
								item.routerIcon = require('../../assets/img/router_icon_' + item.id + '.png');
							})
						}
						if(this.currentPath != '/' && this.currentPath != '/404'){
							this.showCurrentRouter(this.currentPath);
						}
					}
				}).catch(err => {
					console.log(err);
				})
			},
			//点击导航目录
			clickMenu(num, item, e){
				sessionStorage.removeItem('node');
				if(num === 0){
					this.isActive = [];
				}else if(num === 1 && !item.children){
					this.isActive[2] = '';
					this.reload();
					let query = {};
					if(item.id == 23 || item.id == 24) query.pageType = '2';
					this.$router.push({path: item.router, query: query});
				}else if(num === 2){
					this.reload();
					let query = {};
					if(item.id == 9999 || item.id == 9997){
						query.pageType = '1';
					}else if(item.id == 9998 || item.id == 9996){
						query.pageType = '2';
					}
					this.$router.push({path: item.router, query: query});
				}
				this.isActiveThree = false;
				this.$set(this.isActive, num, item.id);
				if(num == 1 && item.children){
					let ele;
					e.path.forEach(item => {
						if(item.className == 'menu-item-item'){
							ele = item;
						}
					})
					let addWidth = document.getElementsByClassName('menu-item')[0].clientWidth;
					ele.childNodes[1].style.left = ele.getBoundingClientRect().left + addWidth + 8 + 'px';
					ele.childNodes[1].style.top = ele.getBoundingClientRect().top + 'px';
					this.isActiveThree = true;
				}
				this.$parent.clickMenu(num, item.name, item.comName);
			},
			//跟据当前路由展示导航
			showCurrentRouter(path){
				let crumbsList = [];
				this.listData.forEach(item => {
					item.children.forEach(items => {
						if(items.children && items.children.length > 0){
							let childrenList = items.children;
							childrenList.forEach(val => {
								if(val.router == path){
									this.isActive[0] = item.id;
									this.isActive[1] = items.id;
									if(items.id == 23 && this.$route.query.pageType == '1'){
										this.isActive[2] = 9999;
										crumbsList[2] = '一级组织机构';
									}
									if(items.id == 23 && this.$route.query.pageType == '2'){
										 this.isActive[2] = 9998;
										 crumbsList[2] = '多级组织机构';
									}
									if(items.id == 24 && this.$route.query.pageType == '1'){
										this.isActive[2] = 9997;
										crumbsList[2] = '一级规章分类';
									}
									if(items.id == 24 && this.$route.query.pageType == '2'){
										this.isActive[2] = 9997;
										crumbsList[2] = '多级规章分类';
									}
									crumbsList[0] = item.name;
									crumbsList[1] = items.name;
									
								}
							})
						}else{
							if(items.router == path){
								this.isActive[0] = item.id;
								this.isActive[1] = items.id;
								crumbsList[0] = item.name;
								crumbsList[1] = items.name;
							}
						}
					})
				})
				if(path == '/fileMaintain/uploadFile') crumbsList = ['文件维护', '上传文件', '上传规章文件'];
				if(path == '/revisionPlanManage/revisionPlanPutDetail') crumbsList = ['制修订计划管理', '制修订计划提报'];
				if(path == '/revisionPlanManage/revisionPlanPutAdd') crumbsList = ['制修订计划管理', '制修订计划提报', '提报'];
				if(path == '/systemManage/managementofthekeyvalue') crumbsList = ['系统管理', '数字字典', '管理键值'];
				if(path == '/soliciting/editsolicitingopinions') crumbsList = ['意见征求','意见征求统计', '编辑意见征求'];
				if(path == '/soliciting/viewcommentdetails') crumbsList = ['意见征求','意见征求统计', '查看意见征求详情'];
				if(path == '/soliciting/opiniondetails') crumbsList = ['意见征求','意见征求统计', '意见详情'];
			
				this.$parent.getCurrentCrumbs(crumbsList);
			},
			//显示三级目录后点击任意位置隐藏三级菜单
			changeThreeMenu(){
				this.isActiveThree = false;
			}
		},
		watch:{
			isActiveThree(newVal, oldVal){
				if(newVal){
					document.body.style.overflow='hidden';
					document.getElementsByClassName('router_content')[0].style.overflow='hidden';
					setTimeout(()=>{
						window.document.addEventListener('click', this.changeThreeMenu)
					}, 500);
				}else{
					window.document.removeEventListener('click', this.changeThreeMenu)
					document.body.style.overflow='auto';
					document.getElementsByClassName('router_content')[0].style.overflow='auto';
				}
			},
			isChange(newVal){
				if(newVal){
					this.showCurrentRouter(this.$route.path);
					this.$store.dispatch('changeIsAddRoute', false);
				}
			}
		}
	}
</script>

<style scoped="scoped" lang="scss">
	.menu{
		.menu-item{
			padding: 22.5px 14px;
			position: relative;
			min-height: 20px;
			clear: both;
			cursor: pointer;
			font-weight: bold;
			.item_box{
				display: flex;
				align-items: center;
				justify-content: space-between;
				.icon{
					width: 16px;
					height: 16px;
				}
				.title{
					display: inline-block;
					width: 1.55rem;
					text-align: left;
				}
				.right_triangle {
					width:0;
					height:0;
					border-top: 6px solid transparent;
					border-bottom: 6px solid transparent;
					border-left: 6px solid #666666;
				}
				.bottom_triangle{
					width:0;
					height:0;
					border-left: 6px solid transparent;
					border-right: 6px solid transparent;
					border-top: 6px solid #666666;
				}
			}
			.menu-children{
				clear: both;
				padding-top: 20px;
				cursor: pointer;
				.menu-item-item{
					font-size: 14px;
					color: #666666;
					position: relative;
					left: -20px;
					.item_box{
						display: flex;
						align-items: center;
						padding: 13px;
						width: 100%;
						margin-left: 7px;
						span:first-of-type{
							display: inline-block;
							width: 80%;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							margin-left: 25px;
							text-align: left;
						}
						.right_dian{
							display: inline-block;
							width: 6px;
							height: 6px;
							background: #666666;
							border-radius: 3px;
						}
					}
					.three_menu{
						position: fixed;
						z-index: 998;
						text-align: left;
						background: #FFFFFF;
						box-shadow: 0px 4px 9px 0px rgba(0, 28, 63, 0.18);
						border-radius: 4px;
						.menu_box{
							line-height: 40px;
							.three_menu_item{
								padding-left: 12px;
								padding-right: 12px;
							}
							.active_item{
								color: #ffffff;
								background: #00479D;
							}
						}
					}
				}
			}
		}
		.active-menu{
			color: #00479C;
			.right_dian{
				background: #034799;
			}
		}
	}
	.active_color{
		color: #034799;
	}
	.active_bg{
		background: rgb(229, 236, 245);
		.right_dian{
			background: #034799 !important;
		}
	}
</style>
