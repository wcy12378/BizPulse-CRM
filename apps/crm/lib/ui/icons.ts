/**
 * Canonical icon map. Toda feature importa daqui — não direto de @phosphor-icons/react.
 * ADR-05 (Spec 09 §12). Permite swap futuro sem big-bang refactor.
 *
 * Import each supported SSR subpath directly: the aggregate barrel makes the
 * development compiler load thousands of unused icons and SVG definitions.
 * SSR entry points let Server Components
 * render icons without forcing the entire CSR React-context module client-side.
 * Client Components still get fully interactive icons (size/weight/color).
 */

// navigation (inbox icon = Tray in Phosphor)
export { Tray as Inbox } from "@phosphor-icons/react/dist/ssr/Tray";
export { ListChecks } from "@phosphor-icons/react/dist/ssr/ListChecks";
export { ListMagnifyingGlass } from "@phosphor-icons/react/dist/ssr/ListMagnifyingGlass";
export { ArrowsLeftRight } from "@phosphor-icons/react/dist/ssr/ArrowsLeftRight";
export { Plugs } from "@phosphor-icons/react/dist/ssr/Plugs";
export { PlugsConnected } from "@phosphor-icons/react/dist/ssr/PlugsConnected";
export { QrCode } from "@phosphor-icons/react/dist/ssr/QrCode";
export { Kanban } from "@phosphor-icons/react/dist/ssr/Kanban";
export { Users } from "@phosphor-icons/react/dist/ssr/Users";
export { UsersThree } from "@phosphor-icons/react/dist/ssr/UsersThree";
export { Storefront } from "@phosphor-icons/react/dist/ssr/Storefront";
export { Robot } from "@phosphor-icons/react/dist/ssr/Robot";
export { Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
export { ShieldCheck } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
export { Gear } from "@phosphor-icons/react/dist/ssr/Gear";
export { House } from "@phosphor-icons/react/dist/ssr/House";
  // admin platform
export { Buildings } from "@phosphor-icons/react/dist/ssr/Buildings";
export { FlowArrow } from "@phosphor-icons/react/dist/ssr/FlowArrow";
export { ChatsCircle } from "@phosphor-icons/react/dist/ssr/ChatsCircle";
export { ClipboardText } from "@phosphor-icons/react/dist/ssr/ClipboardText";
export { Scales } from "@phosphor-icons/react/dist/ssr/Scales";
export { Gauge } from "@phosphor-icons/react/dist/ssr/Gauge";
export { WifiSlash } from "@phosphor-icons/react/dist/ssr/WifiSlash";
export { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
  // marca da instalação (o revendedor troca nome e cor do produto)
export { Palette } from "@phosphor-icons/react/dist/ssr/Palette";
  // anúncios (Análise → Meta Ads). Megaphone e não outro ChartX: os dois
  // vizinhos do grupo já são gráficos (ChartBar em Desempenho, ChartLineUp em
  // Evolução da IA), e um terceiro gráfico deixaria as três linhas do menu
  // indistinguíveis de relance. Mesma família Phosphor, mesmo peso.
export { Megaphone } from "@phosphor-icons/react/dist/ssr/Megaphone";
  // health dashboard
export { WifiHigh } from "@phosphor-icons/react/dist/ssr/WifiHigh";
export { Brain } from "@phosphor-icons/react/dist/ssr/Brain";
export { ArrowsClockwise } from "@phosphor-icons/react/dist/ssr/ArrowsClockwise";
export { Dot } from "@phosphor-icons/react/dist/ssr/Dot";
  // actions
export { ArrowBendUpLeft } from "@phosphor-icons/react/dist/ssr/ArrowBendUpLeft";
export { List } from "@phosphor-icons/react/dist/ssr/List";
export { Bell } from "@phosphor-icons/react/dist/ssr/Bell";
export { BellSlash } from "@phosphor-icons/react/dist/ssr/BellSlash";
export { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
export { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
export { Smiley } from "@phosphor-icons/react/dist/ssr/Smiley";
export { Check } from "@phosphor-icons/react/dist/ssr/Check";
export { Checks } from "@phosphor-icons/react/dist/ssr/Checks";
export { X } from "@phosphor-icons/react/dist/ssr/X";
export { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
export { Trash } from "@phosphor-icons/react/dist/ssr/Trash";
export { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
export { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
export { Pause } from "@phosphor-icons/react/dist/ssr/Pause";
export { Play } from "@phosphor-icons/react/dist/ssr/Play";
export { SkipForward } from "@phosphor-icons/react/dist/ssr/SkipForward";
export { Copy } from "@phosphor-icons/react/dist/ssr/Copy";
export { DownloadSimple } from "@phosphor-icons/react/dist/ssr/DownloadSimple";
export { Archive } from "@phosphor-icons/react/dist/ssr/Archive";
  // origem de uma captação de formulário (página, IP, link para o lead)
export { Globe } from "@phosphor-icons/react/dist/ssr/Globe";
export { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
export { Tray } from "@phosphor-icons/react/dist/ssr/Tray";
  // feedback
export { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
export { Warning } from "@phosphor-icons/react/dist/ssr/Warning";
export { WarningOctagon } from "@phosphor-icons/react/dist/ssr/WarningOctagon";
export { Info } from "@phosphor-icons/react/dist/ssr/Info";
export { CircleNotch } from "@phosphor-icons/react/dist/ssr/CircleNotch";
  // lgpd
export { Scales as ScalesSimple } from "@phosphor-icons/react/dist/ssr/Scales";
export { Eye } from "@phosphor-icons/react/dist/ssr/Eye";
export { ChartBar } from "@phosphor-icons/react/dist/ssr/ChartBar";
export { ClockCountdown } from "@phosphor-icons/react/dist/ssr/ClockCountdown";
  // painéis de evolução / aprendizado
export { ChartLineUp } from "@phosphor-icons/react/dist/ssr/ChartLineUp";
export { Lightbulb } from "@phosphor-icons/react/dist/ssr/Lightbulb";
  // theme
export { Sun } from "@phosphor-icons/react/dist/ssr/Sun";
export { Moon } from "@phosphor-icons/react/dist/ssr/Moon";
export { MonitorPlay } from "@phosphor-icons/react/dist/ssr/MonitorPlay";
  // conversation
export { ChatCircle } from "@phosphor-icons/react/dist/ssr/ChatCircle";
export { WhatsappLogo } from "@phosphor-icons/react/dist/ssr/WhatsappLogo";
export { InstagramLogo } from "@phosphor-icons/react/dist/ssr/InstagramLogo";
export { MessengerLogo } from "@phosphor-icons/react/dist/ssr/MessengerLogo";
export { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
export { PhoneIncoming } from "@phosphor-icons/react/dist/ssr/PhoneIncoming";
export { PhoneOutgoing } from "@phosphor-icons/react/dist/ssr/PhoneOutgoing";
export { PhoneX } from "@phosphor-icons/react/dist/ssr/PhoneX";
export { Paperclip } from "@phosphor-icons/react/dist/ssr/Paperclip";
export { Microphone } from "@phosphor-icons/react/dist/ssr/Microphone";
export { MicrophoneSlash } from "@phosphor-icons/react/dist/ssr/MicrophoneSlash";
export { Image as ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
export { ImageSquare } from "@phosphor-icons/react/dist/ssr/ImageSquare";
export { MusicNote } from "@phosphor-icons/react/dist/ssr/MusicNote";
export { Note } from "@phosphor-icons/react/dist/ssr/Note";
export { FileText } from "@phosphor-icons/react/dist/ssr/FileText";
export { Lock } from "@phosphor-icons/react/dist/ssr/Lock";
export { Receipt } from "@phosphor-icons/react/dist/ssr/Receipt";
export { Tag } from "@phosphor-icons/react/dist/ssr/Tag";
export { Question } from "@phosphor-icons/react/dist/ssr/Question";
export { Keyboard } from "@phosphor-icons/react/dist/ssr/Keyboard";
  // followup flow builder (Task 6.2)
export { GitBranch } from "@phosphor-icons/react/dist/ssr/GitBranch";
export { Flag } from "@phosphor-icons/react/dist/ssr/Flag";
export { TreeStructure } from "@phosphor-icons/react/dist/ssr/TreeStructure";
  // misc
export { DotsThree } from "@phosphor-icons/react/dist/ssr/DotsThree";
export { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
export { CaretUp } from "@phosphor-icons/react/dist/ssr/CaretUp";
export { CaretDoubleLeft } from "@phosphor-icons/react/dist/ssr/CaretDoubleLeft";
export { CaretDoubleRight } from "@phosphor-icons/react/dist/ssr/CaretDoubleRight";
export { CaretLeft } from "@phosphor-icons/react/dist/ssr/CaretLeft";
export { CaretRight } from "@phosphor-icons/react/dist/ssr/CaretRight";
export { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
export { SignOut } from "@phosphor-icons/react/dist/ssr/SignOut";
export { WebhooksLogo } from "@phosphor-icons/react/dist/ssr/WebhooksLogo";
export { PuzzlePiece } from "@phosphor-icons/react/dist/ssr/PuzzlePiece";
export { UploadSimple } from "@phosphor-icons/react/dist/ssr/UploadSimple";
export { Signpost } from "@phosphor-icons/react/dist/ssr/Signpost";
  // atualização de versão
export { ArrowCircleUp } from "@phosphor-icons/react/dist/ssr/ArrowCircleUp";
  // navegação agrupada (registro em lib/navigation/registry.ts)
export { Funnel } from "@phosphor-icons/react/dist/ssr/Funnel";
export { BookOpen } from "@phosphor-icons/react/dist/ssr/BookOpen";
export { Key } from "@phosphor-icons/react/dist/ssr/Key";
export { UserCircle } from "@phosphor-icons/react/dist/ssr/UserCircle";
export { ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr/ClockCounterClockwise";
  // inbox no celular: voltar para a lista e abrir a ficha do contato
export { IdentificationCard } from "@phosphor-icons/react/dist/ssr/IdentificationCard";
  // agenda (o barril não tinha NENHUM ícone de calendário até aqui)
export { CalendarBlank } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
export { CalendarDots } from "@phosphor-icons/react/dist/ssr/CalendarDots";
export { CalendarPlus } from "@phosphor-icons/react/dist/ssr/CalendarPlus";
export { CalendarX } from "@phosphor-icons/react/dist/ssr/CalendarX";
export { CalendarCheck } from "@phosphor-icons/react/dist/ssr/CalendarCheck";
export { CurrencyDollar } from "@phosphor-icons/react/dist/ssr/CurrencyDollar";
export { GoogleLogo } from "@phosphor-icons/react/dist/ssr/GoogleLogo";
export { MapPin } from "@phosphor-icons/react/dist/ssr/MapPin";
export { ArrowsOutSimple } from "@phosphor-icons/react/dist/ssr/ArrowsOutSimple";
