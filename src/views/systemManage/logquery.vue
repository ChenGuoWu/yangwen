<template>
  <div class="organization">
    <div class="one_level">
      <div class="header">
        <div class="query_info">
          <div class="query_item">
            <span>日志分类</span>
            <el-select
              clearable
              class="search_query width_2rem"
              placeholder="请选择日志分类"
              v-model="queryForm.logClassify"
            >
              <el-option
                v-for="item in Logclassification"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </div>
          <div class="query_item">
            <span>发布时间</span>
            <el-date-picker
              class="search_query"
              v-model="queryForm.pubTime"
              value-format="yyyy-MM-dd"
              type="daterange"
              align="right"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
            >
            </el-date-picker>
          </div>
          <div class="query_item">
            <span>操作用户</span>
            <el-input
              v-model="queryForm.operator"
              class="search_query width_2rem"
            ></el-input>
          </div>
        </div>
        <button class="search_btn" @click="resizeQuery">重置</button>
        <button class="search_btn" @click="init">查询</button>
      </div>
      <div class="table_content" v-loading="loading">
        <el-table
          :header-cell-style="{
            background: '#E1E8F4',
            color: '#333333',
            fontWeight: 'bold',
            textAlign: 'left',
          }"
          height="450"
          :data="tableData"
          :cell-style="{ padding: '0' }"
          :row-style="{ height: '0.4rem' }"
          style="width: 100%; margin-bottom: 0.4rem"
          :cell-class-name="firstClass"
          :header-cell-class-name='headerfirstClass'
        >
          <el-table-column type="index" label="序号" width="150" align="left" >
          </el-table-column>
          <el-table-column
            :show-overflow-tooltip="true"
            prop="operator"
            label="操作用户"
            align="left"
            min-width="20%"
          >
          </el-table-column>
          <el-table-column
            :show-overflow-tooltip="true"
            prop="logClassify"
            label="日志分类"
            align="left"
            min-width="20%"
          >
          </el-table-column>
          <el-table-column
            prop="operationRecord"
            label="操作记录"
            align="left"
            min-width="30%"
          >
          </el-table-column>
          <el-table-column
            label="操作时间"
            align="left"
            min-width="20%"
            prop="operationTime"
          >
          </el-table-column>
          <el-table-column
            label="登录IP地址"
            align="left"
            min-width="20%"
            prop="ipAddress"
          >
          </el-table-column>
        </el-table>
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

export default {
  name: "logquery",

  data() {
    return {
      tableData: [], //表格数据
      loading: false, //是否显示loading
      pageSizes: [10, 15, 20, 25, 30], //可选择显示条数
      pageSize: 10, //每页显示条数，默认为10
      page: 1, //当前页数，默认为1
      total: 0, //数据总条数
      queryForm: {
        //查询表单
        logClassify: "", //日志分类,
        operationStartTime: "", //操作开始时间,
        operationEndTime: "", //操作结束时间,
        operator: "", //操作用户,
        operatorUnitId: "", //操作用户所属组织机构id,
        operatorWorkUnits: "", //操作用户所属一级组织机构id,
        pubTime: "",
      },
      editId: "", //修改数据id
      Logclassification: [
        {
          //日志分类
          label: "组织机构",
          value: 1,
        },
        {
          label: "规章分类",
          value: 2,
        },
        {
          label: "规章标题",
          value: 3,
        },
        {
          label: "规章文件",
          value: 4,
        },
        {
          label: "规章审核",
          value: 5,
        },
        {
          label: "制修订计划",
          value: 6,
        },
      ],
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
  created() {
    this.init();
  },
 mounted() {
    document.getElementsByClassName("router_box")[0].style.height = '7.58rem';
  },
  beforeDestroy() {
    document.getElementsByClassName("router_box")[0].style.height = "7.58rem";
  },
  methods: {
    //初始化数据
    init() {
      this.loading = true;
      let data = {
        ...this.queryForm,
        pageIndex: this.page,
        pageSize: this.pageSize,
      };
      if (data.pubTime) {
        data.operationStartTime = data.pubTime[0];
        data.operationEndTime = data.pubTime[1] + " 23:59:59";
      }
      delete data.pubTime;
      this.$http
        .post("/rule/operationLog/getOperationLogByCondition", data)
        .then((res) => {
          this.loading = false;
          if (res.code == "1") {
            //加工数据 一一对应显示中文
            let tableDatas = res.data.map((item) => {
              if (item.logClassify == 1) {
                item.logClassify = "组织机构";
              }
              if (item.logClassify == 2) {
                item.logClassify = "规章分类";
              }
              if (item.logClassify == 3) {
                item.logClassify = "规章标题";
              }
              if (item.logClassify == 4) {
                item.logClassify = "规章文件";
              }
              if (item.logClassify == 5) {
                item.logClassify = "规章审核";
              }
              if (item.logClassify == 6) {
                item.logClassify = "制修订计划";
              }
              return item;
            });
            this.tableData = tableDatas;
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
    //第一排 的样式
    firstClass(row) {
      if (row.columnIndex == 0) {
        return "addcss";
      }
    },
    //表头第一排样式
     headerfirstClass(row) {

      if (row.columnIndex == 0) {
        return "addcss";
      }
    },
  },
};
</script>

<style scoped="scoped" lang="scss">
.one_level {
  .header {
    height: 122px;
    width: 100%;
    background: #ffffff;
    box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
    border-radius: 10px;
    position: relative;
    .query_info {
      .query_item {
        display: inline-block;
        span {
          font-size: 14px;
          padding-left: 20px;
        }
        /deep/ .el-input__inner {
          height: 32px !important;
          line-height: 32px !important;
        }
        /deep/ .el-range-editor {
          padding: 0 10px;
          position: relative;
          top: 1px;
        }
        /deep/ .el-input__icon {
          line-height: 28px;
        }
      }
    }
    .search_query {
      width: 300px;
      margin-left: 10px;
      margin-top: 20px;
    }
    .search_btn {
      width: 80px;
      height: 32px;
      background: #00479d;
      color: white;
      margin-top: 20px;
      margin-right: 20px;
      border-radius: 4px;
      border: 1px solid #00479d;
      line-height: 32px;
      float: right;
    }
    .pub_btn {
      float: right;
      width: 80px;
      height: 32px;
      background: #00479d;
      color: white;
      border-radius: 4px;
      border: 1px solid #00479d;
      line-height: 32px;
      margin-top: 20px;
      margin-right: 20px;
    }
    .add_btn {
      width: 80px;
      height: 32px;
      background: #00a108;
      border-radius: 4px;
      font-size: 12px;
      color: #ffffff;
      border: 1px solid #00a108;
      float: right;
      cursor: pointer;
      margin-top: 20px;
      margin-right: 20px;
    }
  }

  .table_content {
    height: 550px;
    padding: 20px;
    background: #ffffff;
    box-shadow: 0px 4px 7px 1px rgba(84, 137, 199, 0.09);
    border-radius: 10px;
    margin-top: 20px;
    overflow: hidden;
    /deep/ .el-table{
      height: 460px !important;
    }
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
  /deep/ .el-form-item__content {
    height: 354px;
    overflow-y: auto;
  }
  .required {
    color: #f56c6c;
    position: relative;
    top: -37px;
  }
}
/deep/  .addcss {
  padding-left: 30px !important;
}
</style>
