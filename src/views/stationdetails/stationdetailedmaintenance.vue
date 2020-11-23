<template>
  <div class="organization">
    <stationorg-tree @nodeClick="clickHandler" @nodeClicktwo="clickHandlertwo"></stationorg-tree>
    <div class="one_level">
      <div class="header">
        <div class="query_info">
          <div class="query_item">
            <span>名称</span>
            <el-input
              v-model="queryForm.stationsTitle"
              placeholder="请输入名称"
              class="search_query width_2rem"
            ></el-input>
          </div>

          <div class="query_item">
            <span>文号</span>
            <el-input
              v-model="queryForm.docNo"
              placeholder="请输入文号"
              class="search_query width_2rem"
            ></el-input>
          </div>
          <div class="query_item">
            <span>编号</span>
            <el-input
              v-model="queryForm.serialNumber"
              placeholder="请输入编号"
              class="search_query width_2rem"
            ></el-input>
          </div>
          <div class="query_item">
            <span>时间</span>
            <el-date-picker
              class="search_query"
              v-model="queryForm.pubTime"
              type="daterange"
              align="right"
              unlink-panels
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
            >
            </el-date-picker>
          </div>
          <div class="btns">
            <button class="export_btn" @click="exportes">导出</button>
			<button class="search_btn" @click="resizeQuery">重置</button>
            <button class="search_btn" @click="selectables">查询</button>
            
          </div>
        </div>
      </div>
      <div class="table_content" v-loading="loading">
        <div class="table_box">
          <el-table
            height="100%"
            :header-cell-style="{
              background: '#E1E8F4',
              color: '#333333',
              fontWeight: 'bold',
            }"
            :data="tableData"
            :cell-style="{ padding: '0' }"
            :row-style="{ height: '0.4rem' }"
            style="width: 100%; margin-bottom: 0.2rem"
			@selection-change="changeFun"
			:cell-class-name="powerClass"
            :header-cell-class-name="headerpowerClass"
          >
           <el-table-column
							align="center"
							
							type="selection"
							width="55">
						</el-table-column>
            <el-table-column
              type="index"
              align="center"
              label="序号"
              width="80"
            >
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="stationsTitle"
              label="站段细标题"
              min-width="35%"
            >
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="serialNumber"
              label="编号"
              min-width="35%"
            >
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="docNo"
              label="文号"
              min-width="35%"
            >
            </el-table-column>
            <el-table-column prop="implDate" label="施行时间" min-width="20%">
            </el-table-column>
            <el-table-column align="center" label="操作" min-width="20%">
              <template slot-scope="scope">
                <el-button
                  style="margin: 0 auto"
                  @click="edits(scope.row)"
                  type="text"
                  size="small"
                  >编辑</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page"
          :page-sizes="pageSizes"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import stationorgTree from "../components/stationorgTree.vue";
export default {
  name: "Stationdetailedmaintenance",
  components: {
    stationorgTree,
  },
  data() {
    return {
		exportsids:'',//导出的参数
      tableData: [], //表格数据
      loading: false, //是否显示loading
      pageSizes: [10, 15, 20, 25, 30], //可选择显示条数
      pageSize: 10, //每页显示条数，默认为10
      page: 1, //当前页数，默认为1
      total: 0, //数据总条数
      queryForm: {
        //查询表单
        workUnits: "",
        stationsSuperId: "",
        stationsId: "",
        stationsTitle: "",
        implDateStart: "",
        implDateEnd: "",
        docNo: "",
        serialNumber: '',
      },
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
    };
  },
  methods: {
	     //状态的样式
    powerClass(row) {
      if (row.columnIndex == 6) {
        return "addcssborder";
      }
    },
    //状态表头对应的样式
    headerpowerClass(row) {
      if (row.columnIndex == 6) {
        return "addcssborder";
      }
    },
	  //点击查询时查询表格
	  selectables(){
		  this.initTable()
	  },
    //查询表格数据
    initTable() {
      this.loading = true;
      let data = {
        ...this.queryForm,
        pageIndex: this.page,
        pageSize: this.pageSize,
      };
      if (data.pubTime) {
        data.releaseTimeStart = data.pubTime[0];
        data.releaseTimeEnd = data.pubTime[1] + " 23:59:59";
      }
      delete data.pubTime;
      this.$http
        .post("/rule/stationsMaintain/getStationsMaintainByCondition", data)
        .then((res) => {
          this.loading = false;
          if (res.code == "1") {
            this.tableData = res.data;
            this.total = res.pageInfo.total;
          } else {
            this.total = 0;
            this.tableData = [];
            this.$message.error(res.msg);
          }
        })
        .catch((err) => {
          this.loading = false;
          console.log(err);
        });
    },
    //树节点点击触发事件
    clickHandler(nodeData) {
	  //清空二级三级
	   this.queryForm.stationsSuperId='';
	  this.queryForm.stationsId='';
	  this.queryForm.workUnits=nodeData.id;
      this.initTable();
    },
    //树节点点击触发事件
    clickHandlertwo(nodeData) {
	  //存在三级
	  if (nodeData.chilren&&nodeData.chilren.length) {
		    //清空三级的id
			  this.queryForm.stationsId=nodeData.id=''
		    this.queryForm.stationsSuperId=nodeData.chilren[0].stationsSuperId;
			  this.initTable();
	  }else{
		  this.queryForm.stationsSuperId=nodeData.stationsSuperId;
		  this.queryForm.stationsId=nodeData.id;
      		this.initTable();
	  }
	},
	//选中的数据
	changeFun(row){
		let ids=''
		row.forEach(item=>{
			ids+=`${item.id},`
		})
		this.exportsids=ids
		
	},
    //修改每页显示条数
    handleSizeChange(val) {
      this.pageSize = val;
      this.page = 1;
      this.init();
    },
    //修改当前显示页
    handleCurrentChange(val) {
      this.page = val;
      this.init();
	},
	//重置查询表单
    resizeQuery() {
      Object.keys(this.queryForm).forEach((key) => {
        this.queryForm[key] = "";
      });
	},
	//导出
	exportes(){
		let data={
			ids:this.exportsids
		}
		 this.$http
        .post("/rule/stationsMaintain/exportRuleStationsMaintain", data)
        .then((res) => {
          this.loading = false;
          if (res.code == "1") {
			  window.open(res.data)
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch((err) => {
          this.loading = false;
          console.log(err);
        });
	},
	//点击编辑时
	edits(row){
		console.log(row)
	}
  },
};
</script>

<style scoped="scoped" lang="scss">
.one_level {
  width: 84%;
  float: left;
  margin-left: 20px;
  .header {
    height: 124px;
    width: 100%;
    background: #ffffff;
    box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
    border-radius: 10px;
    position: relative;
    .query_info {
      display: inline-block;
      .query_item {
        display: inline-block;
        span {
          font-size: 14px;
          padding-left: 20px;
        }
        /deep/ .el-input__icon {
          line-height: 32px;
        }
      }
    }

    .search_query {
      width: 300px;
      margin-left: 10px;
      margin-top: 20px;
      /deep/ .el-input__inner {
        height: 32px !important;
        line-height: 32px !important;
      }
    }
    .btns {
      width: 100%;
      margin-left: 200px;
      height: 20px;
      .search_btn {
        width: 80px;
        height: 32px;
        background: #00479d;
        color: white;
        margin-top: 20px;
        margin-left: 20px;
        border-radius: 4px;
        border: 1px solid #00479d;
        line-height: 32px;
        float: right;
      }
      .export_btn {
        width: 80px;
        height: 32px;
        background: #ffffff;
        color: #00479d;
        margin-top: 20px;
        margin-left: 20px;
        border-radius: 4px;
        border: 1px solid #00479d;
        line-height: 32px;
        float: right;
      }
      .add_btn {
        width: 80px;
        height: 32px;
        background: #00a108;
        border-radius: 4px;
        font-size: 12px;
        color: #ffffff;
        border: 1px solid #00a108;
        margin-top: 20px;
        margin-left: 20px;
        cursor: pointer;
        float: right;
      }
    }
  }

  .table_content {
    height: 500px;
    padding: 20px;
    background: #ffffff;
    box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
    border-radius: 10px;
    margin-top: 20px;
  }
}
.is_required {
  /deep/ .el-form-item__label {
    padding-left: 10px !important;
    &::before {
      content: "*";
      color: #f56c6c;
      margin-right: 4px;
    }
  }
  .required {
    color: #f56c6c;
    position: relative;
    top: -37px;
  }
}
.role_number {
  /deep/ .el-form-item__content {
    height: auto;
    line-height: 1;
  }
  .number_item {
    display: flex;
    flex-flow: column;
    padding: 0 5px;
    .number_key {
      width: 32px;
      /deep/ .el-input__inner {
        padding: 0 5px;
        width: 32px;
        height: 32px;
        line-height: 32px;
      }
    }
    span {
      font-size: 12px;
      padding-top: 5px;
      color: #999999;
    }
    &:nth-of-type(2) {
      span {
        font-size: 20px;
        padding: 5px;
      }
    }
    &:nth-last-of-type(2) {
      span {
        font-size: 20px;
        padding: 5px;
      }
    }
    &:last-of-type {
      /deep/ .el-input__inner {
        width: 52px;
      }
    }
  }
}
.el-form /deep/ .el-form-item__content {
  display: flex;
}
.query_item /deep/ .el-range-editor {
  padding: 0 !important;
  height: 32px !important;
  line-height: 32px !important;
}
/deep/ .addcssborder {
  border-left: 1px solid #e1e8f4 !important;
}
</style>
<style>
.el-date-picker__header .el-date-picker__header-label {
  float: left;
  position: relative;
  bottom: 4px;
  left: 33px;
}
.el-date-picker .el-picker-panel__icon-btn {
  margin-top: 0;
}

</style>