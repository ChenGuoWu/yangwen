<template>
  <div class="all">
    <el-form :model="addForm" :rules="rules" ref="addForm">
      <div class="all_header">
        <el-form-item label="单位" prop="workUnits" class="all_title">
          <br />
          <el-select
            class="search_query width_2rem"
            placeholder="请选择所属单位"
            v-model="addForm.workUnits"
            @change="changeselect"
          >
            <el-option
              v-for="item in workUnitsoption"
              :key="item.id"
              :label="item.unitName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>
      <div class="quill_editor">
        <quill-editor
          style="height: 4rem; margin-left: 0.4rem"
          v-model="addForm.content"
          :options="editorOption"
          ref="content"
        >
        </quill-editor>
      </div>
      <div class="file">
        <button class="save_btn" @click="saveData">保存</button>
        <button class="cancel_btn" @click="resizeForm">取消</button>
      </div>
    </el-form>
  </div>
</template>
<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import { quillEditor } from "vue-quill-editor";
// 工具栏配置
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线
  ["blockquote", "code-block"], // 引用  代码块
  [
    {
      header: 1,
    },
    {
      header: 2,
    },
  ], // 1、2 级标题
  [
    {
      list: "ordered",
    },
    {
      list: "bullet",
    },
  ], // 有序、无序列表
  [
    {
      script: "sub",
    },
    {
      script: "super",
    },
  ], // 上标/下标
  [
    {
      indent: "-1",
    },
    {
      indent: "+1",
    },
  ], // 缩进
  // [{'direction': 'rtl'}],                         // 文本方向
  [
    {
      size: ["small", false, "large", "huge"],
    },
  ], // 字体大小
  [
    {
      header: [1, 2, 3, 4, 5, 6, false],
    },
  ], // 标题
  [
    {
      color: [],
    },
    {
      background: [],
    },
  ], // 字体颜色、字体背景颜色
  [
    {
      font: [],
    },
  ], // 字体种类
  [
    {
      align: [],
    },
  ], // 对齐方式
  ["clean"], // 清除文本格式
  ["image"], // 链接、图片、视频
];
export default {
  name: "managementmethod",
  data() {
    return {
      workUnitsoption: [], //下拉框数据

      addForm: {
        workUnits: "",
        content: "",
      },
      rules: {
        workUnits: [
          {
            required: true,
            message: "请输入单位",
            trigger: "blur",
          },
        ],
      },
      editorOption: {
        // 配置项
        theme: "snow", // or 'bubble'
        placeholder: "请输入文章内容",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {},
          },
        },
      },
    };
  },
  components: {
    quillEditor,
  },
  created() {
    this.initworkUnitsoption();
  },
  methods: {
    //获取一级下拉框 数据
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
    //添加数据
    saveData() {
      this.$refs["addForm"].validate((valid) => {
        if (valid) {
          let data = {
            ...this.addForm,
          };
          this.$http
            .post("/rule/adminDepartment/insertAdminDepartment", data)
            .then((res) => {
              if (res.code == "1") {
                this.$message.success("添加成功！");
                this.resizeForm();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch((err) => {
              this.popupLoading = false;
              console.log(err);
            });
        } else {
          this.$message.warning("请确认必填项是否填写完整!");
        }
      });
    },
    //选中下拉框渲染数据
    changeselect() {
      let data = {
          workUnits:this.addForm.workUnits
      };
      this.$http
        .get("/rule/adminDepartment/getContentByCondition", data)
        .then((res) => {
          if (res.code == "1") {
            this.addForm.content = res.data[0].content;
          } else {
              this.addForm.content=''
            this.$message.error(res.msg);
          }
        })
        .catch((err) => {
          this.loading = false;
          console.log(err);
        });
    },
    //重置添加内容
    resizeForm() {
      Object.keys(this.addForm).forEach((key) => {
        this.addForm[key] = null;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.all {
  background: #ffffff;
  height: 690px;
  .all_header {
    width: 100%;
    height: 95px;
    .all_title {
      width: 670px;
      float: left;
      margin: 20px;
    }
    .all_submitter {
      width: 250px;
      float: left;
      margin: 20px;
      margin-left: -80px;
      /deep/ .el-input {
        width: 200px;
        margin-left: -60px !important;
      }
    }
    .all_submitterCall {
      width: 250px;
      float: left;
      margin: 20px;

      /deep/ .el-input {
        margin-left: -70px !important;
        width: 200px;
      }
    }
  }
}
/deep/ .el-input {
  margin-left: -80px !important;
  /deep/ .el-input__inner {
    height: 32px !important;
  }
}
.quill_editor {
  width: 1494px;
  margin: 20px;
  margin-top: 30px;
}

.cancel_btn {
  color: #00479d;
  border: 1px solid #00479d;
  width: 100px;
  height: 36px;
  background: #ffffff;
  float: right;
  margin: 10px;

  outline: #00479d;
}
.save_btn {
  background: #00479d;
  border: 1px solid #00479d;
  width: 100px;
  height: 36px;
  color: #ffffff;
  float: right;
  margin: 10px;

  outline: #00479d;
}
.file {
  position: relative;
  background: #eef6ff;
  height: 60px;
  margin: 60px;
  width: 1460px;
}
/deep/ .el-form-item__label {
  position: relative;
  top: 0;
  left: -30px;
}


</style>
<style lang="scss" >

</style>