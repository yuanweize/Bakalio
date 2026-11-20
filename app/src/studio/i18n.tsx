import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router";
export type Locale = "cs" | "en" | "zh";
const rows = {
  previewSources: ["Zdroje", "Sources", "整理资料"],
  previewOutline: ["Osnova", "Outline", "梳理结构"],
  previewWrite: ["Text", "Writing", "开始写作"],
  previewLabel: [
    "Interaktivní výuková ukázka",
    "Interactive teaching demo",
    "互动教学演示",
  ],
  previewEvidence: [
    "Zobrazit úryvek ze strany 12",
    "Show the excerpt on page 12",
    "查看第 12 页片段",
  ],
  previewSave: ["Uložit v ukázce", "Save in this demo", "保存演示修改"],
  previewSaved: [
    "Uloženo jen v této ukázce",
    "Saved in this demo only",
    "仅保存在当前演示中",
  ],
  previewRestore: [
    "Vrátit předchozí text",
    "Restore earlier text",
    "恢复之前的文字",
  ],
  previewVersion: ["Předchozí verze", "Earlier version", "之前的版本"],
  audience: [
    "Pro tvoji bakalářku, diplomku i další výzkum",
    "For your thesis and whatever comes next",
    "为毕业论文，也为下一次研究",
  ],
  openSourceTitle: [
    "Tvoje texty. Otevřený kód.",
    "Your writing. Open code.",
    "文字由你掌握，代码向你开放。",
  ],
  openSourceText: [
    "Podívej se, jak Bakalio funguje. Kód je pod licencí MIT; vlastní instalace má vlastní databázi a soukromé soubory.",
    "See how Bakalio works. The code is MIT-licensed; a self-hosted instance uses its own database and private file storage.",
    "了解 Bakalio 如何工作。代码采用 MIT 许可，自托管实例使用独立数据库和私有附件存储。",
  ],
  viewCode: ["Prohlédnout kód", "Explore the code", "查看源码"],
  signupClosed: [
    "Zatím si vyzkoušej ukázku",
    "Start with the public demo",
    "先来试试公开演示",
  ],
  signupClosedText: [
    "Registrace na této instalaci ještě není otevřená: doručování e-mailů není nastavené. Ukázku můžeš používat bez účtu. Už máš účet? Přihlas se.",
    "Registration is not open on this instance because email delivery is not configured. Explore the demo without an account, or log in with an existing account.",
    "当前实例尚未配置邮件投递，因此暂不开放注册。你可以免登录体验演示，已有账户仍可登录。",
  ],
  onboarding: [
    "Začni vlastní prací",
    "Make room for your project",
    "开始你的研究项目",
  ],
  onboardingText: [
    "Založ projekt a doplň téma, otázku a termín. Pak přidej první zdroj nebo otevři nový dokument.",
    "Create a project with a topic, research question and deadline. Then add your first source or start a document.",
    "创建项目，填写主题、研究问题和日期，然后添加资料或新建文稿。",
  ],
  recentSources: ["Nedávné zdroje", "Recent sources", "最近资料"],

  sourceShortcut: [
    "PDF, poznámky a citace na jednom místě.",
    "Papers, notes and citations in one place.",
    "文献、笔记和引用，都放在一起。",
  ],
  projectShortcut: [
    "Vrať se ke své otázce a dalšímu kroku.",
    "Back to your question and your next step.",
    "回到研究问题，找到下一步。",
  ],

  teachingExample: ["Výuková ukázka", "Teaching example", "教学示例"],
  teachingMaterial: ["Výukový materiál", "Teaching material", "教学材料"],
  feedbackTitle: [
    "Pomoz nám vyladit Bakalio.",
    "Help shape Bakalio.",
    "一起把 Bakalio 变得更好。",
  ],
  feedbackText: [
    "Chybí ti něco? Něco tě zdržuje? Napiš nám, co by ti usnadnilo práci.",
    "Missing something? Getting stuck? Tell us what would make your writing day easier.",
    "缺了什么？哪里不顺手？告诉我们，怎样才能让你的写作更轻松。",
  ],
  feedbackAction: ["Poslat zpětnou vazbu", "Share feedback", "分享使用反馈"],

  stageNote: [
    "Méně chaosu. Víc přehledu.",
    "Less chaos. More clarity.",
    "少一点混乱，多一点清晰。",
  ],
  scenarioHeading: [
    "Znáš ten pocit?",
    "Sound familiar?",
    "这些时刻，是不是很熟悉？",
  ],
  scenarioIntro: [
    "Tři běžné situace při psaní. Vyber si jednu a vyzkoušej další krok v interaktivní ukázce.",
    "Three familiar writing moments. Pick one and try your next step in the interactive demo.",
    "三个熟悉的写作场景。选一个，在互动演示中试试下一步。",
  ],
  scenarioSources: [
    "Kde byl ten zdroj?",
    "Where did I save that paper?",
    "那篇文献存哪儿了？",
  ],
  scenarioWriting: [
    "Jak navázat na předchozí kapitolu?",
    "Too many tabs. No flow.",
    "一直切窗口，思路都断了。",
  ],
  scenarioVersions: [
    "Co jsem změnil oproti minulé verzi?",
    "The earlier version was better.",
    "还是前一版写得好。",
  ],
  scenarioSourcesText: [
    "Dej zdrojům jedno místo.",
    "A home for every source.",
    "给每份资料一个固定的位置。",
  ],
  scenarioWritingText: [
    "Text a zdroje. Vedle sebe.",
    "Your writing. Your sources. Together.",
    "文稿与资料，就在一起。",
  ],
  scenarioVersionsText: [
    "Zkoušej. K předchozí verzi se vrátíš.",
    "Try a new direction. Keep the old one.",
    "放心尝试新思路，旧版本还在。",
  ],
  versionStory: [
    "Uložené verze si můžeš prohlédnout a obnovit. Když stejný text upravíš ve dvou kartách, Bakalio tě upozorní na konflikt.",
    "Review and restore saved versions. If two tabs edit the same document, Bakalio warns you before a stale save overwrites your work.",
    "查看和恢复已保存的版本。两个标签页同时编辑时，Bakalio 会提示冲突，避免旧内容覆盖新修改。",
  ],
  tryScenario: ["Vyzkoušet v ukázce", "Try it in the demo", "在演示中试试"],

  features: ["Funkce", "Features", "产品功能"],
  workflow: ["Jak to funguje", "How it works", "工作方式"],
  pricing: ["Testovací provoz", "Early access", "测试阶段"],
  faq: ["Otázky a odpovědi", "Questions, answered", "常见问题"],
  support: ["Kontakt a podpora", "Contact & support", "联系与支持"],
  privacy: ["Soukromí", "Privacy", "隐私"],
  terms: ["Podmínky", "Terms", "条款"],
  login: ["Přihlásit se", "Log in", "登录"],
  signup: ["Začít psát", "Start your research", "开始研究"],
  demo: ["Vyzkoušet ukázku", "Explore the demo", "查看演示"],
  hero: [
    "Od zadání k hotové práci. Kapitolu po kapitole.",
    "From proposal to thesis. One section at a time.",
    "从任务书到论文，逐章构建。",
  ],
  heroText: [
    "Zdroje, poznámky a rozepsané kapitoly na jednom místě. V Bakaliu máš přehled a prostor soustředit se na vlastní text.",
    "A writing studio for students and researchers. Keep your sources, notes and chapters together, with room to think and write in your own voice.",
    "为学生和年轻研究者打造的写作空间。资料、笔记与章节放在一起，让你专注于自己的思考和文字。",
  ],
  beta: [
    "Pro tvoji další kapitolu · Beta",
    "Made for your next chapter · Beta",
    "为你的下一章而来 · 测试版",
  ],
  noCard: [
    "V beta verzi zdarma. Bez platební karty.",
    "Free during beta. No credit card needed.",
    "测试期间免费，无需信用卡。",
  ],
  desk: [
    "Od prvního PDF k vlastnímu textu.",
    "From your first PDF to your own words.",
    "从第一份 PDF，到你自己的文字。",
  ],
  deskText: [
    "Měj přehled o zdrojích, poznámkách i kapitolách. Začni jedním krokem a postupně přidávej další.",
    "Keep the thread between a folder of papers, a promising idea and your next paragraph. Every part of your research has a place.",
    "连接散落的文献、有价值的想法和下一段文字，让研究的每一步都有自己的位置。",
  ],
  collect: ["Posbírej zdroje", "Gather your evidence", "收集研究资料"],
  collectText: [
    "Nahraj PDF nebo text. Přidej autora, rok a vlastní štítky. U textových PDF zůstanou zachovaná čísla stránek.",
    "Bring in PDFs and text. Add authors, dates and your own tags. Extracted text retains page references.",
    "上传 PDF 或文本，补充作者、年份和标签。提取的文字保留页码定位。",
  ],
  outline: ["Dej myšlenkám strukturu", "Find your structure", "梳理论文结构"],
  outlineText: [
    "Začni výzkumnou otázkou. Rozděl práci do kapitol a při psaní měj osnovu po ruce.",
    "Start with a research question. Organize chapters as documents and keep an outline beside your writing.",
    "从研究问题出发，按章节组织文档，写作时随时查看大纲。",
  ],
  write: ["Piš se zdroji po ruce", "Write with context", "带着证据写作"],
  writeText: [
    "Zdroje zůstávají vedle textu. Citace odkazují na uložené materiály a starší verze lze obnovit.",
    "Keep sources beside your manuscript. Citations link to saved materials, and earlier versions are recoverable.",
    "让资料始终在文稿旁边。引用关联已保存的资料，历史版本可以恢复。",
  ],
  control: [
    "Tvoje práce. Tvoje rozhodnutí.",
    "Your work. Your decisions.",
    "你的研究，由你掌握。",
  ],
  controlText: [
    "Soukromé soubory vyžadují přihlášení. Žádné sledování textu, automatické publikování ani platby. O přijetí návrhů AI rozhoduješ ty.",
    "Private files require authentication. No manuscript tracking, automatic publishing or payments. You decide which AI suggestions to accept.",
    "私有附件需要身份验证。不采集论文正文，不自动发布或扣费。AI 建议由你决定是否采用。",
  ],
  earlyTitle: [
    "Prostor pro začátek. Bez závazků.",
    "Space to begin. No subscription.",
    "安心开始，无需订阅。",
  ],
  earlyText: [
    "V beta verzi můžeš spravovat projekty, psát a ukládat zdroje. AI zatím není zapojená; v ukázce najdeš označené simulace.",
    "Manage projects, write and organize sources during early access. AI is not configured; the demo uses clearly labeled simulations.",
    "测试阶段可管理项目、写作和整理资料。真实 AI 尚未配置，演示中的模拟会明确标注。",
  ],
  q1: [
    "Napíše za mě celou práci?",
    "Will this write my thesis for me?",
    "会替我完成整篇论文吗？",
  ],
  a1: [
    "Ne. Argumenty i výsledný text jsou tvoje práce. Asistent má pomáhat s dílčími kroky, ne nahrazovat vlastní výzkum.",
    "No. You own the argument and remain responsible for your work. Assistance supports specific steps, not a replacement for research.",
    "不会。研究论点和最终文字由你负责。助手支持具体环节，不替代你的研究。",
  ],
  q2: [
    "Jsou citace automaticky ověřené?",
    "Are citations automatically verified?",
    "引用是否已自动核验？",
  ],
  a2: [
    "Ne. Citace propojí text se zdrojem. Přesnost, stránku a to, zda zdroj podporuje tvrzení, zkontroluj sám.",
    "No. Citations connect your writing to sources. You still need to check accuracy, page numbers and what the evidence supports.",
    "没有。引用将文稿与资料关联，准确性、页码及论据是否支持结论仍需你检查。",
  ],
  q3: [
    "Mohu práci exportovat?",
    "Can I take my writing with me?",
    "可以导出文稿吗？",
  ],
  a3: [
    "Ano. V editoru jako Markdown nebo text, z přehledu práce také jako DOCX v obecném rozvržení. OCR skenů zatím není k dispozici.",
    "Yes. Export Markdown or plain text in the editor, or an editable generic DOCX from your thesis overview. OCR for scans is not yet available.",
    "编辑器支持 Markdown 与纯文本；论文概览支持可编辑的通用 DOCX。扫描件 OCR 尚未提供。",
  ],
  projects: ["Projekty", "Projects", "项目"],
  library: ["Knihovna zdrojů", "Source library", "资料库"],
  overview: ["Přehled", "Overview", "概览"],
  settings: ["Nastavení", "Settings", "设置"],
  usage: ["Využití", "Usage", "用量"],
  billing: ["Platby", "Billing", "账单"],
  admin: ["Administrace", "Administration", "管理后台"],
  logout: ["Odhlásit se", "Log out", "退出"],
  welcome: [
    "Pokračuj ve své práci.",
    "Continue your thesis.",
    "继续完成你的论文。",
  ],
  welcomeSub: [
    "Tvoje zdroje a rozepsané kapitoly. Všechno připravené, až budeš chtít pokračovat.",
    "Your questions, sources and unfinished thoughts. Ready when you are.",
    "你的问题、资料和尚未完成的思考，都在这里等你继续。",
  ],
  newProject: ["Nový projekt", "New project", "新建项目"],
  newDoc: ["Nový dokument", "New document", "新建文档"],
  continue: ["Pokračovat v psaní", "Continue writing", "继续写作"],
  search: ["Hledat", "Search", "搜索"],
  active: ["Aktivní", "Active", "进行中"],
  archived: ["Archivované", "Archived", "已归档"],
  all: ["Vše", "All", "全部"],
  recent: ["Naposledy upravené", "Recently updated", "最近修改"],
  alphabetical: ["Podle názvu", "Alphabetical", "按标题排序"],
  title: ["Název", "Title", "标题"],
  language: ["Jazyk práce", "Manuscript language", "论文语言"],
  thesisType: ["Typ práce", "Thesis type", "论文类型"],
  discipline: ["Obor", "Discipline", "学科"],
  question: ["Výzkumná otázka", "Research question", "研究问题"],
  method: ["Metoda", "Method", "研究方法"],
  citationStyle: ["Citační styl", "Citation style", "引用样式"],
  targetDate: ["Termín", "Target date", "目标日期"],
  save: ["Uložit", "Save", "保存"],
  cancel: ["Zrušit", "Cancel", "取消"],
  edit: ["Upravit", "Edit", "编辑"],
  delete: ["Smazat", "Delete", "删除"],
  archive: ["Archivovat", "Archive", "归档"],
  unarchive: ["Obnovit z archivu", "Unarchive", "取消归档"],
  confirmDelete: [
    "Opravdu smazat? Tuto akci nelze vrátit.",
    "Delete permanently? This action cannot be undone.",
    "确定永久删除？此操作无法撤销。",
  ],
  empty: [
    "Zatím je tu čistý stůl.",
    "A clean desk, for now.",
    "从一张空白书桌开始。",
  ],
  emptyText: [
    "Založ projekt a začni první otázkou.",
    "Create a project and give your first question a home.",
    "创建一个项目，给你的第一个研究问题安个家。",
  ],
  loading: ["Načítání…", "Loading…", "正在加载…"],
  retry: ["Zkusit znovu", "Try again", "重试"],
  error: [
    "To se nepodařilo. Zkontroluj připojení a zkus to znovu.",
    "That did not work. Check your connection and try again.",
    "操作未成功，请检查连接后重试。",
  ],
  documents: ["Dokumenty", "Documents", "文档"],
  sources: ["Zdroje", "Sources", "资料"],
  words: ["slov", "words", "字/词"],
  saved: ["Vše uloženo", "All changes saved", "所有修改已保存"],
  saving: ["Ukládání…", "Saving…", "正在保存…"],
  unsaved: ["Neuložené změny", "Unsaved changes", "存在未保存修改"],
  conflict: [
    "Text se změnil v jiné kartě. Exportuj svoje úpravy a načti aktuální verzi.",
    "This document changed in another tab. Export your text, then load the current version.",
    "文档已在其他标签页修改。请先导出你的文字，再载入最新版本。",
  ],
  reload: ["Načíst aktuální verzi", "Load current version", "载入最新版本"],
  versions: ["Historie verzí", "Version history", "版本历史"],
  restore: ["Obnovit tuto verzi", "Restore this version", "恢复此版本"],
  export: ["Exportovat", "Export", "导出"],
  plain: ["Prostý text", "Plain text", "纯文本"],
  manuscript: ["Text", "Manuscript", "文稿"],
  assistant: ["Asistent", "Assistant", "助手"],
  outlineNav: ["Osnova", "Outline", "大纲"],
  sourceNotes: ["Poznámky ke zdrojům", "Source notes", "资料笔记"],
  insertCitation: ["Vložit citaci", "Insert citation", "插入引用"],
  page: ["Strana", "Page", "页码"],
  addSource: ["Přidat zdroj", "Add a source", "添加资料"],
  authors: ["Autoři", "Authors", "作者"],
  year: ["Rok", "Year", "年份"],
  tags: [
    "Štítky (oddělené čárkou)",
    "Tags (comma separated)",
    "标签（逗号分隔）",
  ],
  upload: [
    "PDF nebo TXT, nejvýše 10 MB",
    "PDF or TXT, up to 10 MB",
    "PDF 或 TXT，不超过 10 MB",
  ],
  download: ["Stáhnout soubor", "Download file", "下载文件"],
  manual: ["Ručně přidaný zdroj", "Manual source", "手动录入资料"],
  queued: ["Čeká na zpracování", "Queued for extraction", "等待提取"],
  ready: ["Text extrahován", "Text extracted", "已提取文字"],
  needs_ocr: ["Vyžaduje OCR", "Needs OCR", "需要 OCR"],
  failed: ["Zpracování selhalo", "Extraction failed", "提取失败"],
  sourceInUse: [
    "Zdroj je použitý v citaci. Nejdřív vyřeš související dokumenty; použitý zdroj zatím smazat nejde.",
    "This source is cited. Remove the linked documents before deleting it.",
    "此资料已被引用，请先删除关联文档。",
  ],
  demoLabel: ["Ukázková data", "Demo data", "演示数据"],
  demoNotice: [
    "Fiktivní výukový projekt. Úpravy jsou jen v této kartě a po obnovení zmizí.",
    "Fictional teaching project. Edits live only in this tab and reset on refresh.",
    "虚构教学项目。编辑仅保留在当前标签页，刷新后重置。",
  ],
  mock: ["Simulovaná AI", "Simulated AI", "模拟 AI"],
  aiDisabled: [
    "AI zatím není zapojená. Můžeš dál psát, pracovat se zdroji a vkládat citace.",
    "AI is not configured. Writing and sources work without it.",
    "AI 尚未配置，写作与资料管理仍可正常使用。",
  ],
  outlineTask: ["Navrhnout osnovu", "Suggest an outline", "建议大纲"],
  summarize: ["Shrnout zdroj", "Summarize a source", "总结资料"],
  rewrite: ["Přeformulovat výběr", "Rewrite selection", "改写选中文字"],
  checkSources: [
    "Zkontrolovat chybějící zdroje",
    "Check for missing sources",
    "检查缺少来源的段落",
  ],
  accept: ["Přijmout návrh", "Accept suggestion", "接受建议"],
  reject: ["Odmítnout", "Dismiss", "拒绝"],
  aiHint: [
    "Návrh není ověřený důkaz. Před přijetím ho zkontroluj.",
    "A suggestion is not verified evidence. Review before accepting.",
    "建议不是经过核验的证据，请审阅后再接受。",
  ],
  theme: ["Vzhled", "Theme", "外观"],
  light: ["Světlý", "Light", "浅色"],
  dark: ["Tmavý", "Dark", "深色"],
  interfaceLanguage: ["Jazyk rozhraní", "Interface language", "界面语言"],
  account: ["Účet", "Account", "账户"],
  email: ["E-mail", "Email", "邮箱"],
  password: ["Heslo", "Password", "密码"],
  forgot: ["Zapomenuté heslo", "Forgot password", "忘记密码"],
  reset: ["Nastavit nové heslo", "Reset password", "重设密码"],
  verify: ["Ověřit e-mail", "Verify email", "验证邮箱"],
  checkEmail: [
    "Podívej se do e-mailu a otevři ověřovací odkaz.",
    "Check your email and open the confirmation link.",
    "请查收邮件并打开确认链接。",
  ],
  send: ["Odeslat", "Send", "发送"],
  message: ["Zpráva", "Message", "留言"],
  sent: [
    "Zpráva byla uložena. Děkujeme.",
    "Your message has been saved. Thank you.",
    "留言已保存，谢谢。",
  ],
  supportText: [
    "Zprávy jsou uloženy do místní administrace. Veřejný provozovatel a podpora ještě nejsou určeni.",
    "Messages are saved to local administration. A public operator and support contact have not yet been designated.",
    "留言将保存至本地管理后台。公共运营主体和支持联系方式尚未确定。",
  ],
  draft: [
    "Pracovní návrh — bez právní kontroly",
    "Draft — not legally reviewed",
    "草稿——未经法律审阅",
  ],
  privacyText: [
    "Účet, projekty, texty a zdroje ukládáme do místní databáze a soukromého úložiště. Neodesíláme text do AI ani analytiky. Obsah můžete mazat v aplikaci. Pro odstranění účtu použijte kontaktní formulář; správce odstraní účet a soubory. Zálohy vyžadují samostatné vymazání. Před veřejným spuštěním je nutné určit provozovatele, dobu uchování a právní základ.",
    "Accounts, projects, manuscripts and sources are stored in the local database and private storage. Text is not sent to AI or analytics. Delete content in the app. For account deletion, use the contact form; an administrator must remove the account and files. Backups need separate deletion. Operator details, retention and legal basis must be established before public launch.",
    "账户、项目、文稿和资料保存在本地数据库与私有存储中。正文不会发送到 AI 或分析服务。可在应用中删除内容；删除账户请使用联系表单，由管理员移除账户和文件。备份需单独删除。公开发布前须确定运营主体、保留期限与法律依据。",
  ],
  termsText: [
    "Testovací software bez záruky dostupnosti. Odpovídáte za oprávnění k materiálům, správnost citací a dodržení pravidel školy. Simulovaná AI není odborné posouzení. Platby jsou vypnuté. Před veřejným spuštěním je nutná právní kontrola.",
    "Early-access software without an availability guarantee. You are responsible for rights to uploaded materials, citation accuracy and your institution’s rules. Simulated AI is not expert review. Payments are disabled. Legal review is required before public launch.",
    "测试软件不保证可用性。你负责上传资料的权利、引用准确性及遵守学校规定。模拟 AI 不属于专业审查。收费已关闭，公开发布前须完成法律审核。",
  ],
  units: ["Tokeny modelu", "Model tokens", "模型 Token"],
  zeroUsage: [
    "Žádná volání modelu. Simulace se neúčtují.",
    "No model calls. Simulations are not billed.",
    "没有模型调用，模拟结果不计费。",
  ],
  back: ["Zpět", "Back", "返回"],
  close: ["Zavřít", "Close", "关闭"],
  bold: ["Tučné", "Bold", "加粗"],
  italic: ["Kurzíva", "Italic", "斜体"],
  heading: ["Nadpis", "Heading", "标题"],
  list: ["Seznam", "List", "列表"],
  quote: ["Citace bloku", "Block quote", "引用块"],
  link: ["Odkaz", "Link", "链接"],
  table: ["Tabulka", "Table", "表格"],
  newTitle: ["Nová kapitola", "New chapter", "新章节"],
  note: ["Vlastní poznámky", "Research notes", "研究笔记"],
  notFound: ["Nenalezeno", "Not found", "未找到"],
  selection: [
    "Vyber text v dokumentu.",
    "Select text in the manuscript.",
    "请在文稿中选中文字。",
  ],
  toggleOutline: [
    "Zobrazit nebo skrýt osnovu",
    "Toggle outline",
    "显示或隐藏大纲",
  ],
  toggleSources: [
    "Zobrazit nebo skrýt zdroje",
    "Toggle sources",
    "显示或隐藏资料",
  ],
  menu: ["Navigace", "Navigation", "导航"],
  project: ["Projekt", "Project", "项目"],
  none: ["Bez projektu", "No project", "不关联项目"],
} as const;
export type Key = keyof typeof rows;
export const tr = (locale: Locale, key: Key) =>
  rows[key][locale === "cs" ? 0 : locale === "en" ? 1 : 2];
const Context = createContext({
  locale: "cs" as Locale,
  theme: "light",
  setLocale: (_: Locale) => {},
  setTheme: (_: string) => {},
  t: (k: Key) => tr("cs", k),
});
export function Preferences({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathLocale = location.pathname.split("/")[1];
  const [locale, setL] = useState<Locale>(
    ["cs", "en", "zh"].includes(pathLocale) ? (pathLocale as Locale) : "cs",
  );
  const [theme, setT] = useState("light");
  useEffect(() => {
    if (!["cs", "en", "zh"].includes(pathLocale)) {
      const saved = localStorage.getItem("rs.locale");
      if (saved && ["cs", "en", "zh"].includes(saved)) setL(saved as Locale);
    }
    setT(localStorage.getItem("rs.theme") === "dark" ? "dark" : "light");
  }, []);
  useEffect(() => {
    if (["cs", "en", "zh"].includes(pathLocale)) setL(pathLocale as Locale);
  }, [pathLocale]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.theme = theme;
  }, [locale, theme]);
  const setLocale = (l: Locale) => {
    setL(l);
    localStorage.setItem("rs.locale", l);
    if (["cs", "en", "zh"].includes(pathLocale) || location.pathname === "/")
      navigate(
        "/" +
          l +
          (location.pathname.split("/").slice(2).join("/")
            ? "/" + location.pathname.split("/").slice(2).join("/")
            : ""),
      );
  };
  const setTheme = (s: string) => {
    setT(s);
    localStorage.setItem("rs.theme", s);
  };
  return (
    <Context.Provider
      value={{ locale, theme, setLocale, setTheme, t: (k) => tr(locale, k) }}
    >
      {children}
    </Context.Provider>
  );
}
export const useI18n = () => useContext(Context);
