# Bakalio

从任务书开始，逐章完成论文。把要求、蓝图、正文与资料放在同一个学生工作台中。

[交互演示](https://bakalio.eurun.eu.org/demo) · [开发者指南](README.md) · [实现状态](IMPLEMENTATION_STATUS.md)

目前支持任务书文本录入、明确字段定位、人工确认、通用蓝图版本、章节文稿、自动保存和历史恢复。界面支持捷克语、英语、简体中文，切换界面不会翻译你的论文。

DOI 查询只核对 Crossref 元数据，不代表全文或论述已经核验。DOCX 导出为可编辑的通用排版，使用前仍需核对学校要求，并在 Word 中更新目录。

项目仍在开发。公开演示使用虚构材料与模拟 AI；生产 AI、支付和公开自助注册仍关闭。通用蓝图不冒充 AI 生成或学校认证模板。完整批注修订、语义证据核验和商业计费尚未完成。

本地启动需要 Node 24.22.1+、Docker Compose。执行 `./scripts/setup.sh`，再运行 `./scripts/wasp start --client-port 4310 --server-port 4311`。本地验证邮件进入 Mailpit，不能当作真实外发邮箱。配置、备份和安全边界见英文指南。

代码采用 MIT，保留 Open SaaS / Wasp 的版权声明。不承诺保证通过论文或规避学校 AI 使用政策。
