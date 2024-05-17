<!-- 暂不支持ssr，如果要支持ssr，需要包裹no-ssr -->
<template>
  <Editor
    v-model="html"
    :init="{
      ...initOption,
      ...$attrs,
      images_upload_handler,
      file_callback,
    }"
  />
</template>

<script>
import tinymce from "tinymce/tinymce";
import Editor from "@tinymce/tinymce-vue";
import "tinymce/themes/silver/theme";
import "tinymce/models/dom/model";
import "tinymce/icons/default";

import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/charmap";
import "tinymce/plugins/preview";
import "tinymce/plugins/anchor";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/code";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/media";
import "tinymce/plugins/table";
import "tinymce/plugins/help";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/pagebreak";
// import 'tinymce/plugins/visualchars'
import "tinymce/plugins/template";
import "tinymce/plugins/nonbreaking";
// import 'tinymce/plugins/emoticons'
// import 'tinymce/plugins/emoticons/js/emojis'
import "tinymce/plugins/quickbars/plugin";

// import 'tinymce-plugin' //作为一些插件的必要依赖
// import 'tinymce-plugin/plugins/tpIndent2em'
// import 'tinymce-plugin/plugins/tpLayout'
// import 'tinymce-plugin/plugins/tpImportword'

import "./plugins";
import "./lang/zh_CN";
import { TYPE_UTIL } from "@/packages/utils/type";

export default {
  inheritAttrs: false,
  name: "ElRichTextEditor",
  components: {
    Editor,
  },
  config: {
    doUpload: null,
    baseUrl: "/",
  },
  props: {
    value: { type: String, default: "" },
    doUpload: { type: Function },
    baseUrl: { type: String, default: "" },
    options: { type: Object, default: () => ({}) },
  },
  data() {
    let baseUrl = this.baseUrl || this.$options.config.baseUrl;
    if (baseUrl[baseUrl.length - 1] === "/") {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1);
    }
    // const { plugins, toolbar } = this.options
    return {
      html: this.value,
      initOption: {
        promotion: false,
        language: "zh_CN",
        // skin_url: `${baseUrl}/tinymce/skins/ui/oxide`,
        // content_css: `${baseUrl}/tinymce/skins/content/default/content.css`,
        toolbar_sticky: true,
        draggable_modal: true,
        convert_urls: false,
        font_family_formats:
          "微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;宋体=simsun,serif;仿宋=FangSong,serif;黑体=SimHei,sans-serif;楷体=楷体;隶书=隶书;幼圆=幼圆;Consolas=Consolas;Times New Roman=Times New Roman;",
        min_height: 600,
        font_size_formats: "12px 13px 14px 15px 16px 18px 24px 36px 48px 56px 72px",
        font_size_input_default_unit: "px",
        plugin_preview_width: "1600",
        branding: false,
        // emoticons tpIndent2em tpLayout tpImportword
        plugins:
          "advlist lists image media table wordcount preview charmap code fullscreen link template searchreplace pagebreak insertdatetime quickbars  formatpainter ", // indent2em upfile importword
        toolbar: [
          "fullscreen searchreplace undo redo formatpainter removeformat fontfamily fontsize blocks forecolor backcolor bold italic underline subscript superscript alignleft aligncenter alignright alignjustify outdent indent tpIndent2em lineheight | numlist bullist media image upfile tpLayout tpImportword  quicklink blockquote anchor",
        ],
        automatic_uploads: true, // tpImportword
      },
    };
  },
  computed: {
    hasUpload() {
      return (
        TYPE_UTIL.isFunction(this.doUpload) ||
        TYPE_UTIL.isFunction(this.$options.config.doUpload)
      );
    },
  },
  watch: {
    value(val) {
      this.html = val;
    },
    html(val) {
      this.$emit("change", val);
    },
  },
  mounted() {
    tinymce.init({});
  },
  methods: {
    images_upload_handler(blobInfo, success, failure) {
      if (this.hasUpload) {
        const file = blobInfo.blob();
        this.handleUpload(file, success);
      } else {
        failure();
      }
    },
    file_callback(file, success, failure) {
      if (this.hasUpload) {
        this.handleUpload(file, success);
      } else {
        failure();
      }
    },
    handleUpload(file, success) {
      const setUrl = (url) => {
        success(url, { text: file.name });
      };
      if (TYPE_UTIL.isFunction(this.doUpload)) {
        this.doUpload.call(this, file, success)?.then(setUrl);
      } else if (TYPE_UTIL.isFunction(this.$options.config.doUpload)) {
        this.$options.config.doUpload.call(this, file, success)?.then(setUrl);
      }
    },
  },
};
</script>

<style></style>
