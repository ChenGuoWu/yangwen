<template>
  <div class="organization">
    <div class="one_level">
      <div class="header">
        <div class="query_info">
          <div class="query_item">
            <span>名称</span>
            <el-input
              v-model="queryForm.catalogRevisionPlanName"
              class="search_query width_2rem"
            ></el-input>
          </div>
          <div class="query_item">
            <span>文号</span>
            <el-input
              v-model="queryForm.docNo"
              class="search_query width_2rem"
            ></el-input>
          </div>
          <div class="query_item">
            <span>发文时间</span>
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
            <span>发文部门</span>
            <el-input
              v-model="queryForm.responsibleDeptName"
              class="search_query width_2rem"
            ></el-input>
          </div>
        </div>
        <div>
          <template v-if="userRole">
            <span class="super">所属单位</span>
            <el-select
              clearable
              class="search_query width_2rem"
              placeholder="请选择所属单位"
              v-model="queryForm.workUnits"
              @change="changeselect"
              @clear="clears"
            >
              <el-option
                v-for="item in workUnitsoption"
                :key="item.id"
                :label="item.unitName"
                :value="item.id"
              ></el-option>
            </el-select>
            <span class="super">所属部门</span>
            <el-select
              clearable
              class="search_query width_2rem"
              placeholder="请选择所属部门"
              v-model="queryForm.responsibleDeptId"
            >
              <el-option
                v-for="item in departmentoption"
                :key="item.id"
                :label="item.unitName"
                :value="item.id"
              ></el-option>
            </el-select>
          </template>
          <button class="add_btn" @click="addData">新增</button>
          <button class="search_btn" @click="resizeQuery">重置</button>
          <button class="search_btn" @click="init">查询</button>
        </div>
      </div>
      <div class="table_content" v-loading="loading">
        <div class="table_box">
          <el-table
            height="100%"
            @selection-change="handleSelectionChange"
            :header-cell-style="{
              background: '#E1E8F4',
              color: '#333333',
              fontWeight: 'bold',
            }"
            :data="tableData"
            :cell-style="{ padding: '0' }"
            :row-style="{ height: '0.40rem' }"
            style="width: 100%; margin-bottom: 0.4rem"
            :cell-class-name="powerClass"
            :header-cell-class-name="headerpowerClass"
          >
            
            <el-table-column
              type="index"
              label="序号"
              min-width="13%"
              align="center"
            >
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="catalogRevisionPlanName"
              label="名称"
              min-width="30%"
            >
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="docNo"
              label="文号"
              min-width="20%"
            >
            </el-table-column>
            <el-table-column
              prop="releaseTime"
              label="发文时间"
              min-width="15%"
            >
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="responsibleDeptName"
              label="发布部门"
              min-width="16%"
            >
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="originalName"
              label="文件"
              min-width="20%"
            ></el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              prop="catalogRevisionPlanStatus"
              label="状态"
              min-width="15%"
            >
              <template slot-scope="scope">
                <span
                  :style="{
                    color:
                      scope.row.catalogRevisionPlanStatus == 1
                        ? '#00479D'
                        : '#333333',
                  }"
                  >{{
                    scope.row.catalogRevisionPlanStatus == "1" ? "有效" : "无效"
                  }}</span
                >
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="150">
              <template slot-scope="scope">
                <el-button
                  style="padding: 0 0.2rem; color: #00479d"
                  @click="editData(scope.row)"
                  type="text"
                  size="small"
                  >编辑</el-button
                >
                <el-button
                  style="padding-right: 0.2rem; color: #ff3d3d"
                  @click="deleteData(scope.row)"
                  type="text"
                  size="small"
                  >删除</el-button
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
    <popup
      v-loading="popupLoading"
      :popupWidth="'6'"
      :popupHeight="'6'"
      v-if="showPopup"
      @confim="saveData"
      @cancel="
        showPopup = false;
        resizeForm();
      "
      :show="showPopup"
      :title="popupTitle"
    >
      <el-form
        style="margin: 40px 40px 0px 0px"
        ref="addForm"
        :rules="rules"
        :model="addForm"
        label-width="60px"
      >
        <el-form-item prop="managementMethodName" label="名称">
          <el-input
            v-model="addForm.managementMethodName"
            placeholder="名称"
            class="inputs"
          ></el-input>
        </el-form-item>
        <el-form-item prop="docNo" label="文号">
          <el-input
            v-model="addForm.docNo"
            placeholder="请输入规章文号"
            class="inputs"
          ></el-input>
        </el-form-item>
        <el-form-item prop="releaseTime" label="发文时间">
          <el-date-picker
            v-model="addForm.releaseTime"
            type="date"
            placeholder="选择日期"
            :value-format="'yyyy-MM-dd'"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="responsibleDeptName" label="负责部门">
          <el-input
            v-model="addForm.responsibleDeptName"
            placeholder="请输入负责部门"
            class="inputs"
          ></el-input>
        </el-form-item>
        <template v-if="userRole">
          <el-form-item prop="workUnits" label="所属单位">
            <el-select
              clearable
              class="search_query width_2rem"
              placeholder="请选择所属单位"
              v-model="addForm.workUnits"
              @change="changeselect"
              @clear="clears"
            >
              <el-option
                v-for="item in workUnitsoption"
                :key="item.id"
                :label="item.unitName"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="responsibleDeptId" label="所属部门">
            <el-select
              clearable
              class="search_query width_2rem"
              placeholder="请选择所属部门"
              v-model="addForm.responsibleDeptId"
            >
              <el-option
                v-for="item in departmentoption"
                :key="item.id"
                :label="item.unitName"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </template>
        <div class="file">
          <el-upload
            multiple
            class="upload-demo"
            :http-request="uploadRequest"
            action=""
            :file-list="fileList"
            :on-remove="handleRemove"
            :auto-upload="false"
            :on-preview="handlePreview"
            ref="upload"
          >
            <el-button plain class="clickfile">选择</el-button>
          </el-upload>
        </div>
        <el-divider class="divider"></el-divider>
        <el-form-item label="状态" class="formpower">
          <el-radio-group v-model="addForm.catalogRevisionPlanStatus">
            <el-radio :label="1">有效</el-radio>
            <el-radio :label="0">无效</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </popup>
  </div>
</template>

<script>
import popup from "../../components/popup.vue";

export default {
  name: "managementmethod",
  components: {
    popup,
  },
  data() {
    return {
      fileList: [],
      userRole: "", //权限
      tableData: [], //表格数据
      loading: false, //是否显示loading
      pageSizes: [10, 15, 20, 25, 30], //可选择显示条数
      pageSize: 10, //每页显示条数，默认为10
      page: 1, //当前页数，默认为1
      total: 0, //数据总条数
      showPopup: false, //是否打开弹窗
      popupTitle: "添加", //弹窗标题
      addForm: {
        managementMethodName: "",
        docNo: "",
        releaseTime: "",
        responsibleDeptName: "",
        workUnits: "",
        responsibleDeptId: "",
        catalogRevisionPlanStatus: 0,
        file: "",
      },
      rules: {
        managementMethodName: [
          {
            required: true,
            message: "请输入管理办法名称",
            trigger: "blur",
          },
        ],
        docNo: [
          {
            required: true,
            message: "请输入规章文号",
            trigger: "blur",
          },
        ],
        releaseTime: [
          {
            required: true,
            message: "请输入发文时间",
            trigger: "blur",
          },
        ],
        responsibleDeptName: [
          {
            required: true,
            message: "请输入负责部门",
            trigger: "blur",
          },
        ],
        workUnits: [
          {
            required: true,
            message: "请输入负责单位",
            trigger: "blur",
          },
        ],
        workUnits: [
          {
            required: true,
            message: "请输入负责单位",
            trigger: "blur",
          },
        ],
        responsibleDeptId: [
          {
            required: true,
            message: "请输入所属部门",
            trigger: "blur",
          },
        ],
      },
      popupLoading: false, //弹窗loading
      queryForm: {
        //查询表单
        catalogRevisionPlanName: "",
        docNo: "",
        releaseTimeStart: "",
        releaseTimeEnd: "",
        pubTime: "",
        responsibleDeptName: "",
        responsibleDeptId: "", //所属组织机构id,
        workUnits: "", //一级组织机构id
        catalogRevisionPlanStatus: "", //状态
      },
      editId: "", //修改数据id
      //一级组织机构id配置项
      workUnitsoption: [],
      //部门配置项
      departmentoption: [],

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
      multipleSelection: [], //表格选中的数据
      uploadData: "", //上传数据
      fileList: [], //上传文件list
    };
  },
  created() {
    this.power();
    this.initworkUnitsoption();
    this.init();
  },
  mounted() {
    document.getElementsByClassName("router_box")[0].style.height = "7.58rem";
  },
  beforeDestroy() {
    document.getElementsByClassName("router_box")[0].style.height = "7.58rem";
  },
  methods: {
    //获取权限
    power() {
      if (JSON.parse(window.sessionStorage.getItem("userInfo")).userRole == 1) {
        this.userRole = true;
      } else {
        this.userRole = false;
        //赋值不是超级管理员的两个字段
        this.queryForm.workUnits = JSON.parse(
          window.sessionStorage.getItem("userInfo")
        ).workUnits;
        this.queryForm.responsibleDeptId = JSON.parse(
          window.sessionStorage.getItem("userInfo")
        ).unitId;
        this.addForm.workUnits = JSON.parse(
          window.sessionStorage.getItem("userInfo")
        ).workUnits;
        this.addForm.responsibleDeptId = JSON.parse(
          window.sessionStorage.getItem("userInfo")
        ).unitId;
      }
    },
    //获取一级组织机构配置项
    initworkUnitsoption() {
      let data = {
        id: 0,
      };
      this.$http
        .post("/rule/unit/getRuleUnitListByParentId", data)
        .then((res) => {
          this.loading = false;
          if (res.code == "1") {
            this.workUnitsoption = res.data;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch((err) => {
          this.loading = false;
          console.log(err);
        });
    },
    //下拉框清空按钮
    clears() {
      this.departmentoption = []
      this.queryForm.responsibleDeptId = "";
      this.addForm.responsibleDeptId = "";
    },
    //选择一级单位后发送请求获取部门
    changeselect(val) {
      if (val) {
        const departmentarr = this.workUnitsoption.filter((item) => {
          return item.id == val;
        });
        let data = {
          id: departmentarr[0].id,
        };
        this.$http
          .post("/rule/unit/getRuleUnitListByParentId", data)
          .then((res) => {
            this.loading = false;
            if (res.code == "1") {
              const newarr = res.data.concat(res.dataTwo);
              if (newarr[0]) {
                this.departmentoption = newarr;
              }
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch((err) => {
            this.loading = false;
            console.log(err);
          });
      }
    },
    //初始化数据
    init() {
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
        .post(
          "/rule/catalogRevisionPlan/getCatalogRevisionPlanByCondition",
          data
        )
        .then((res) => {
          this.loading = false;
          if (res.code == "1") {
            const tableDatas = res.data.map((item) => {
              item.releaseTime = item.releaseTime.substring(0, 10);
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
    //上传到服务器
    uploadRequest(params) {
      this.uploadData.append("file", params.file); //传文件
    },
    //表格多选事件
    handleSelectionChange(val) {
      this.multipleSelection = val;
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
    //打开弹窗
    addData() {
      this.popupTitle = "新增技术规章目录及制修订计划维护";
      this.editId = "";
      this.showPopup = true;
    },
    //状态的样式
    powerClass(row) {
      if (row.columnIndex == 7) {
        return "addcss";
      }
      if (row.columnIndex == 8) {
        return "addcssborder";
      }
    },
    //状态表头对应的样式
    headerpowerClass(row) {
      if (row.columnIndex == 7) {
        return "addcss";
      }
      if (row.columnIndex == 8) {
        return "addcssborder";
      }
    },
    //删除文件
    handleRemove(file, fileList) {
      if (this.editId != "") {
        let data = {
          id: this.editId,
          delFileAbsolutePath: file.path,
        };
        this.$http
          .post("/rule/catalogRevisionPlan/deleteFile", data)
          .then((res) => {
            if (res.code === 1) {
              this.$message.success("删除文件成功！");
              this.init();
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    handlePreview(file) {
      window.open(file.lookPath);
    },
    //添加数据
    saveData() {
      this.$refs["addForm"].validate((valid) => {
        if (valid) {
          this.uploadData = new FormData();
          this.popupLoading = true;
          this.$refs.upload.submit();
          this.publishData();
        } else {
          this.$message.warning("请确认必填项是否填写完整!");
        }
      });
    },
    //推送数据
    publishData() {
      if (!this.editId) {
        this.uploadData.append(
          "managementMethodName",
          this.addForm.managementMethodName
        );
        this.uploadData.append("docNo", this.addForm.docNo);
        this.uploadData.append("releaseTime", this.addForm.releaseTime);
        this.uploadData.append(
          "responsibleDeptName",
          this.addForm.responsibleDeptName
        );
        this.uploadData.append("workUnits", this.addForm.workUnits);
        this.uploadData.append(
          "responsibleDeptId",
          this.addForm.responsibleDeptId
        );
        this.uploadData.append(
          "catalogRevisionPlanStatus",
          this.addForm.catalogRevisionPlanStatus
        );
        this.$http
          .post(
            "/rule/catalogRevisionPlan/addRuleCatalogRevisionPlan",
            this.uploadData,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          )
          .then((res) => {
            if (res.code == "1") {
              this.popupLoading = false;
              this.showPopup = false;
              this.$message.success("添加成功！");
              this.resizeForm();
              this.init();
            } else {
              this.popupLoading = false;
              this.$message.error(res.msg);
            }
          })
          .catch((err) => {
            this.popupLoading = false;
            console.log(err);
          });
      } else {
        this.uploadData.append("id", this.editId);
        this.uploadData.append(
          "managementMethodName",
          this.addForm.managementMethodName
        );
        this.uploadData.append("docNo", this.addForm.docNo);
        this.uploadData.append("releaseTime", this.addForm.releaseTime);
        this.uploadData.append(
          "responsibleDeptName",
          this.addForm.responsibleDeptName
        );
        this.uploadData.append("workUnits", this.addForm.workUnits);
        this.uploadData.append(
          "responsibleDeptId",
          this.addForm.responsibleDeptId
        );
        this.uploadData.append(
          "catalogRevisionPlanStatus",
          this.addForm.catalogRevisionPlanStatus
        );
        this.$http
          .post(
            "/rule/catalogRevisionPlan/updateRuleCatalogRevisionPlan",
            this.uploadData,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          )
          .then((res) => {
            if (res.code == "1") {
              this.popupLoading = false;
              this.showPopup = false;
              this.$message.success("修改成功！");
              this.resizeForm();
              this.init();
            } else {
              this.popupLoading = false;
              this.$message.error(res.msg);
            }
          })
          .catch((err) => {
            this.popupLoading = false;
            console.log(err);
          });
      }
    },
    //重置添加内容
    resizeForm() {
      Object.keys(this.addForm).forEach((key) => {
        this.addForm[key] = null;
        this.fileList = [];
      });
    },
    //编辑数据
    editData(row) {
      this.editId = row.id;
      this.popupTitle = "修改";
      Object.keys(this.addForm).forEach((key) => {
        this.addForm[key] = row[key];
      });
      if (row.filePath) {
        let arr = row["originalName"].split(",");
        let pathList = row["fileAbsolutePath"].split(",");
        let lookPathList = row["filePath"].split(",");
        arr.forEach((name, index) => {
          this.fileList.push({
            name: name,
            path: pathList[index],
            lookPath: lookPathList[index],
          });
        });
      }

      this.showPopup = true;
    },
    //删除数据
    deleteData(row) {
     
      this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let data = {
            id: row.id,
          };
          this.$http
            .get(
              "/rule/catalogRevisionPlan/delRuleCatalogRevisionPlanById",
              data
            )
            .then((res) => {
              if (res.code == "1") {
                this.$message({
                  type: "success",
                  message: "删除成功!",
                });
                this.init();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },

    //重置查询表单
    resizeQuery() {
      Object.keys(this.queryForm).forEach((key) => {
        this.queryForm[key] = "";
      });
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
.super {
  margin-left: 20px;
}
/deep/ .addcss {
  text-align: center !important;
}
/deep/ .addcsscenter {
  text-align: center !important;
  border-left: 1px solid #e1e8f4 !important;
}
/deep/ .addcssborder {
  border-left: 1px solid #e1e8f4 !important;
}

.file {
  width: 500px;
  height: 70px;
}
.file .upload-demo {
  display: flex;
  width: 100%;
  height: 60px;
  margin-left: 50px;
  justify-content: space-between;
  /deep/ .el-upload-list {
    overflow-y: auto !important;
    width: 300px !important;
    height: 60px !important;
    margin-top: -20px;
  }
}
.clickfile {
  color: #00479d;
  height: 20px;
  line-height: 5px;
  border: 1px solid #00479d;
}
.divider {
  width: 520px;
  margin: -20px 0 0 40px;
}
.formpower {
  margin-left: -30px;
  .el-radio {
    margin-left: 20px;
  }
}
</style>
