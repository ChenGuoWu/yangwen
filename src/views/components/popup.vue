<template>
	<div class="popup" v-show="showPopup">
		<div class="popup_box" @mousedown="downHandler" @mousemove="moveHandler" :style="{height: (popupHeight) + 'rem', width: (popupWidth) + 'rem'}">
			<div class="header">
				<span>{{title}}</span>
				<img @click="cancel" src="@/assets/img/gb.png" alt="">
			</div>
			<div class="content" :style="{overflow: overflow ? 'auto' : 'visible', height: (popupHeight - 1) + 'rem'}">
				<slot></slot>
			</div>
			<div class="footer">
				<button v-if="isShowUpload" @click="$emit('upload')" class="upload_btn">上传文件</button>
				<button v-if="!readOnly" class="success" @click="$emit('confim')">{{confimText}}</button>
				<button v-if="!readOnly" class="cancel_btn" @click="cancel">取消</button>
			</div>
		</div>
	</div>
</template>

<script>
	export default{
		props:{
			show: {
				type: Boolean,
				default: false
			},
			title: {
				type: String,
				default: ''
			},
			popupWidth: {
				type: String,
				default: '5'
			},
			popupHeight: {
				type: String,
				default: '4.04'
			},
			overflow: {
				type: Boolean,
				default: false
			},
			isShowUpload: {
				type: Boolean,
				default: false
			},
			readOnly: {
				type: Boolean,
				default: false
			},
			confimText: {
				type: String,
				default: '确定'
			}
		},
		data(){
			return {
				showPopup: false
			}
		},
		created() {
			document.body.style.overflow='hidden';
		},
		mounted() {
			if(Number(this.popupWidth) > 6){
				let cancelBtn = document.getElementsByClassName('cancel_btn')[0];
				cancelBtn.style.left = '920px';
			}
			this.showPopup = this.show;
		},
		methods:{
			//取消或关闭弹窗
			cancel(){
				this.showPopup = false;
				this.$emit('cancel', false);
				document.body.style.overflow='auto';
			},
			//鼠标按下
			downHandler(){
				console.log('111');
			},
			//鼠标移动
			moveHandler(){
				console.log('111');
			},
		}
	}
</script>

<style lang="scss" scoped="scoped">
	.popup{
		position:fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 2001;
		background: rgba($color: #000000, $alpha: 0.6);
		.popup_box{
			background: #FFFFFF;
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			.header{
				height: 40px;
				background: #00479D;
				display: flex;
				align-items: center;
				justify-content: space-between;
				span{
					color: white;
					font-size: 14px;
					margin-left: 18px;
				}
				img{
					width: 14px;
					height: 14px;
					margin-right: 20px;
					cursor: pointer;
				}
			}
			.footer{
				.upload_btn{
					left: 160px;
				}
				.success{
					left: 160px;
				}
				button{
					position: absolute;
					bottom: 20px;
					width: 80px;
					height: 32px;
					border-radius: 2px;
					font-size: 12px;
					cursor: pointer;
					background: #00479D;
					border: 1px solid #00479D;
					color: #ffffff;
					&:nth-of-type(2){
						left: 260px;
					}
					&:nth-of-type(3){
						left: 920px !important;
					}
					&:last-of-type{
						border: 1px solid #00479D;
						color: #00479D;
						background: #ffffff;
						left: 260px;
					}
				}
			}
		}
	}
</style>
