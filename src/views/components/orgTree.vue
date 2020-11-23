<template>
	<div class="orgTree" v-loading="loading">
		<el-tree
		  :props="props"
		  :empty-text="'暂无数据'"
		  :data="treeData"
		  @node-click="nodeClick"
		  :default-expanded-keys="defaultNodeKey"
		  ref="vuetree"
		  highlight-current
		  :node-key="'classId'">
		</el-tree>
	</div>
</template>

<script>
	export default{
		data(){
			return {
				props: {   //tree配置
					children: 'children',
					label: 'ruleNodeName'
				},
				userInfo: {}, //用户信息
				loading: false, //加载loading
				treeData: [],  //tree数据
				defaultNodeKey: [],  //默认展开节点
			}
		},
		created() {
			this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
			this.init();
		},
		methods:{
			//根据用户组织机构id初始化tree数据
			init(){
				this.loading = true;
				this.$http.post('/rule/classTree/getRuleClassTreeByUser').then(res => {
					this.loading = false;
					if (res.code == '1') {
						this.treeData = res.data;
						if(sessionStorage.getItem('node')){
							let obj = JSON.parse(sessionStorage.getItem('node'));
							this.defaultNodeKey.push(obj.parentId, obj.classId);
							this.$nextTick(() => {
								this.$refs['vuetree'].setCurrentKey(obj.classId);
							})
							this.$emit('nodeClick', obj);
							sessionStorage.removeItem('node');
						}
					} else {
						this.$message.error(res.msg);
					}
				}).catch(err => {
					this.loading = false;
					console.log(err);
				})
			},
			//节点点击事件
			nodeClick(nodeData, node){
				this.$emit('nodeClick', nodeData);
			}
		}
	}
</script>

<style scoped="scoped" lang="scss">
	.orgTree{
		width: 14%;
		height: 654px;
		padding-top: 30px;
		background: #FFFFFF;
		box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
		border-radius: 10px;
		float: left;
		overflow: auto;
	}
	.el-tree{
		width: 100%;
		display: inline-block;
		/deep/ .is-current{
			color: #00479D !important;
		}
	}
	.el-tree>.el-tree-node {
		display: inline-block;
		min-width: 100%;
	}
	/deep/ .el-tree-node__label {
	    font-size: 12px !important;
	}
</style>
