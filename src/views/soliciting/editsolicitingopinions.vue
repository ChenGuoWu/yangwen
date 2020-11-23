<template>
  <div class="all">
    <el-form :model="addForm" :rules="rules" ref="addForm">
      <div class="all_header">
        <el-form-item
          label="发文标题"
          prop="solicitationTitle"
          class="all_title"
        >
          <br />
          <el-input v-model="addForm.solicitationTitle"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="submitter" class="all_submitter">
          <br />
          <el-input v-model="addForm.submitter"></el-input>
        </el-form-item>
        <el-form-item
          label="联系方式"
          prop="submitterCall"
          class="all_submitterCall"
        >
          <br />
          <el-input v-model="addForm.submitterCall"></el-input>
        </el-form-item>
      </div>
      <div class="quill_editor">
        <quill-editor
          style="height: 3.5rem; margin-left: 0.4rem"
          v-model="addForm.solicitationDetails"
          :options="editorOption"
          ref="content"
        >
        </quill-editor>
      </div>
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
          <div class="file_operating">
            <button class="select_btn">选择文件</button>
          </div>
        </el-upload>
        <button class="cancel_btn" @click="resizeForm">取消</button>
        <button class="save_btn" @click="saveData">保存</button>
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
  name: "editsolicitingopinions",
  data() {
    return {
      fileList: [],
      addForm: {
        solicitationTitle: "",
        solicitationDetails: "",
        submitter: "",
        submitterCall: "",
        file: "",
      },
      rules: {
        solicitationTitle: [
          {
            required: true,
            message: "请输入发文标题",
            trigger: "blur",
          },
        ],
        submitter: [
          {
            required: true,
            message: "请输入联系人",
            trigger: "blur",
          },
        ],
        submitterCall: [
          {
            required: true,
            message: "请输入联系方式",
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
      uploadData() {},
    };
  },
  components: {
    quillEditor,
  },
  created() {
    this.editIds();
  },
  methods: {
    //编辑数据
    editIds() {
        let rows;
      if (this.$route.query.row) {
          rows=JSON.parse(this.$route.query.row)
        this.editId = rows.id;
        Object.keys(this.addForm).forEach((key) => {
          this.addForm[key] = rows[key];
        });
        if (rows.solicitationFilepath) {
             let arr = rows["originalName"].split(",");
          let pathList = rows["solicitationFileabsolutepath"].split(",");
          let lookPathList = rows["solicitationFilepath"].split(",");
          arr.forEach((name, index) => {
            this.fileList.push({
              name: name,
              path: pathList[index],
              lookPath: lookPathList[index],
            });
          });
        } 
         
      }
    },
    //上传到服务器
    uploadRequest(params) {
      this.uploadData.append("file", params.file); //传文件
    },
    //删除文件
    handleRemove(file, fileList) {
      if (this.editId != "") {
        let data = {
          id: this.editId,
          delFileabsolutepath: file.path,
        };
        this.$http
          .post("/rule/opinionSolicitation/deleteFile", data)
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
          "solicitationTitle",
          this.addForm.solicitationTitle
        );
        this.uploadData.append(
          "solicitationDetails",
          this.addForm.solicitationDetails
        );
        this.uploadData.append("submitter", this.addForm.submitter);
        this.uploadData.append("submitterCall", this.addForm.submitterCall);
        this.$http
          .post(
            "/rule/opinionSolicitation/insertRuleOpinionSolicitation",
            this.uploadData,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          )
          .then((res) => {
            if (res.code == "1") {
              this.$message.success("添加成功！");
              this.resizeForm();
              this.init();
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        this.uploadData.append("id", this.editId);
        this.uploadData.append(
          "solicitationTitle",
          this.addForm.solicitationTitle
        );
        this.uploadData.append(
          "solicitationDetails",
          this.addForm.solicitationDetails
        );
        this.uploadData.append("submitter", this.addForm.submitter);
        this.uploadData.append("submitterCall", this.addForm.submitterCall);
        this.$http
          .post(
            "/rule/opinionSolicitation/updateRuleOpinionSolicitation",
            this.uploadData,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          )
          .then((res) => {
            if (res.code == "1") {
              this.$message.success("修改成功！");
              this.resizeForm();
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
    //重置添加内容
    resizeForm() {
      Object.keys(this.addForm).forEach((key) => {
        this.addForm[key] = null;
        this.fileList = [];
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
.file_operating {
  background: #eef6ff;
  width: 1460px;
  height: 60px;
  margin: 100px 40px 40px 60px;

  .select_btn {
    color: #00479d;
    border: 1px solid #00479d;
    width: 100px;
    height: 36px;
    background: #ffffff;
    float: left;
    margin: 10px;
  }
}
.cancel_btn {
  color: #00479d;
  border: 1px solid #00479d;
  width: 100px;
  height: 36px;
  background: #ffffff;
  float: right;
  margin: 10px;
  position: relative;
  left: -20px;
  top: -100px;
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
  position: relative;
  left: -40px;
  top: -100px;
  outline: #00479d;
}
.file {
  position: relative;
  /deep/ .el-upload-list {
    position: absolute;
    left: 60px;
    top: 30px;
    height: 50px;
    overflow-y: auto;
    width: 1455px;
    background: #F4F7FC !important;
  }
}

</style>