/** All people, companies and commercial terms below are fictional demo fixtures. */
export const DEMO_PIPELINE = { slug: "demo-b2b-export", name: "B2B Export Demo" } as const;
export const DEMO_STAGES = [
  { slug: "inquiry", name: "Inquiry", position: 1000 },
  { slug: "qualified", name: "Qualified", position: 2000 },
  { slug: "quotation", name: "Quotation", position: 3000 },
  { slug: "negotiation", name: "Negotiation", position: 4000 },
  { slug: "won", name: "Won", position: 5000 },
  { slug: "lost", name: "Lost", position: 6000 },
] as const;
export const B2B_FIXTURES = [
  { key: "harbor-bottles", name: "Mira Alden", company: "Harbor Fern Trading (fictional)", market: "United States", product: "304不锈钢保温杯", quantity: 3000, unitPrice: 6.4, terms: "FOB Ningbo", leadDays: 35, stage: "inquiry", task: "确认保温杯容量与激光标识需求", dueHours: -3, priority: "high", taskStatus: "pending" },
  { key: "north-led", name: "Evan Vale", company: "North Alder Supply (fictional)", market: "Canada", product: "24W LED线性灯", quantity: 1200, unitPrice: 18.5, terms: "FOB Shenzhen", leadDays: 30, stage: "qualified", task: "收集LED灯具认证与色温要求", dueHours: 4, priority: "high", taskStatus: "in_progress" },
  { key: "cedar-packaging", name: "Nora Venn", company: "Cedar Loom Retail (fictional)", market: "United Kingdom", product: "FSC牛皮纸折叠包装盒", quantity: 20000, unitPrice: 0.68, terms: "FOB Shanghai", leadDays: 25, stage: "quotation", task: "复核包装盒刀模与阶梯报价", dueHours: 24, priority: "medium", taskStatus: "pending" },
  { key: "dune-fittings", name: "Sami Orlen", company: "Dune Orchard Industrial (fictional)", market: "United Arab Emirates", product: "黄铜快接管件", quantity: 8000, unitPrice: 2.35, terms: "FOB Ningbo", leadDays: 28, stage: "negotiation", task: "核对管件螺纹标准及付款条款", dueHours: 30, priority: "high", taskStatus: "pending" },
  { key: "bloom-textiles", name: "Lena Fenn", company: "Bloom Estuary Home (fictional)", market: "Germany", product: "纯棉毛巾套装", quantity: 5000, unitPrice: 4.8, terms: "FOB Qingdao", leadDays: 40, stage: "quotation", task: "确认毛巾色样与报价有效期", dueHours: 48, priority: "medium", taskStatus: "pending" },
  { key: "maple-tools", name: "Owen Sorel", company: "Maple Tern Hardware (fictional)", market: "Australia", product: "12件套手动工具组", quantity: 1500, unitPrice: 12.6, terms: "FOB Shanghai", leadDays: 32, stage: "won", task: "归档工具组样品确认及采购订单", dueHours: -24, priority: "low", taskStatus: "done" },
  { key: "silver-cables", name: "Aria Marden", company: "Silver Reed Devices (fictional)", market: "Singapore", product: "USB-C 100W编织线", quantity: 10000, unitPrice: 1.95, terms: "FOB Shenzhen", leadDays: 21, stage: "negotiation", task: "比较线材新版交期与旧版报价", dueHours: 6, priority: "urgent", taskStatus: "pending" },
  { key: "coral-bags", name: "Theo Wren", company: "Coral Meadow Goods (fictional)", market: "New Zealand", product: "再生涤纶购物袋", quantity: 6000, unitPrice: 1.4, terms: "FOB Xiamen", leadDays: 30, stage: "lost", task: "记录购物袋项目预算流失原因", dueHours: -48, priority: "low", taskStatus: "done" },
] as const;
