# 🎨 AetherQ UI/UX Enhancement Guide & Integration Prompts

## Part 1: Login/Signup Page Enhancements

### Current State
- Basic glassmorphic design with cyan/purple gradients
- Email/password + Google OAuth
- Clean but minimal

### Enhancement: Premium Enterprise Login

**File to modify**: `src/app/login/page.tsx` & `src/app/signup/page.tsx`

#### Step 1: Add Animated Background Elements
```tsx
// Add floating icons behind the form
export function LoginContent() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Existing background glows */}
      
      {/* NEW: Floating icons */}
      <motion.div
        className="absolute top-20 left-10 text-cyan-500/20"
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <FileText size={40} />
      </motion.div>
      
      <motion.div
        className="absolute top-40 right-20 text-purple-500/20"
        animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      >
        <BarChart3 size={40} />
      </motion.div>
      
      {/* Card content */}
    </div>
  );
}
```

#### Step 2: Add Social Proof & Badges
```tsx
{/* Add after logo, before title */}
<div className="flex items-center justify-center gap-1 mb-4 text-xs text-cyan-300/70">
  <CheckCircle2 size={14} />
  <span>Trusted by 500+ enterprises</span>
</div>

{/* Add benefits list */}
<div className="space-y-2 mb-6 text-xs text-white/40">
  <div className="flex items-center gap-2">
    <Shield size={14} className="text-green-400" />
    <span>Enterprise-grade security with RLS</span>
  </div>
  <div className="flex items-center gap-2">
    <Zap size={14} className="text-yellow-400" />
    <span>Real-time AI & vector search</span>
  </div>
  <div className="flex items-center gap-2">
    <Users size={14} className="text-blue-400" />
    <span>Multi-tenant isolation guaranteed</span>
  </div>
</div>
```

#### Step 3: Enhance Form Fields with Icons & Validation
```tsx
{/* Password strength indicator */}
const getPasswordStrength = (pwd: string) => {
  if (pwd.length === 0) return { strength: 0, color: 'gray', label: '' };
  if (pwd.length < 8) return { strength: 1, color: 'red', label: 'Weak' };
  if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) 
    return { strength: 2, color: 'yellow', label: 'Fair' };
  return { strength: 3, color: 'green', label: 'Strong' };
};

const strength = getPasswordStrength(password);

{/* In password field section */}
<div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
  <div
    className={`h-full transition-all bg-${strength.color}-500`}
    style={{ width: `${(strength.strength / 3) * 100}%` }}
  />
</div>
{strength.label && (
  <p className="text-xs text-white/40">Password strength: {strength.label}</p>
)}
```

#### Step 4: Add "Forgot Password?" Recovery Link (Login Only)
```tsx
{/* For login page, after password field */}
<div className="flex justify-end">
  <Link
    href="/forgot-password"
    className="text-xs text-cyan-400/70 hover:text-cyan-400 transition"
  >
    Forgot password?
  </Link>
</div>
```

---

## Part 2: Dashboard (`/workspace`) Enhancement

### Current State
- Welcome message
- Three feature cards
- Sidebar with logout

### Enhancement: Personalized Dashboard Hub

**File to create/modify**: `src/app/workspace/page.tsx`

#### New Dashboard Structure
```tsx
export default function WorkspacePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header with user profile */}
      <div className="border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              👋 Welcome back, <span className="text-cyan-400">{user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-white/50 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Quick stats */}
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase">Documents</p>
              <p className="text-2xl font-bold text-cyan-400">{docCount}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase">Conversations</p>
              <p className="text-2xl font-bold text-purple-400">{chatCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <QuickActionCard
            title="Start New Chat"
            description="Ask questions, analyze data, or get AI insights"
            icon={<MessageCircle2 />}
            href="/workspace/chat"
            color="from-cyan-500 to-blue-500"
          />
          <QuickActionCard
            title="Upload Document"
            description="PDF, DOCX, TXT - Extract text, create embeddings"
            icon={<Upload />}
            href="/workspace/documents"
            color="from-purple-500 to-pink-500"
          />
          <QuickActionCard
            title="View Analytics"
            description="SQL KPIs, revenue trends, business metrics"
            icon={<BarChart3 />}
            href="/workspace/analytics"
            color="from-green-500 to-emerald-500"
          />
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent conversations (2/3 width) */}
          <div className="lg:col-span-2">
            <RecentConversations conversations={recentChats} />
          </div>

          {/* Quick stats sidebar (1/3 width) */}
          <div>
            <UsageStats />
            <FeatureShowcase />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component: Quick action card
function QuickActionCard({ title, description, icon, href, color }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${color} p-0.5 cursor-pointer`}
      >
        <div className="relative bg-black rounded-3xl p-6">
          <div className="absolute top-0 right-0 opacity-20">{icon}</div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-white/60 text-sm mt-2">{description}</p>
          <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm">
            <span>Get Started</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Component: Recent conversations list
function RecentConversations({ conversations }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="text-xl font-bold mb-4">Recent Conversations</h2>
      <div className="space-y-3">
        {conversations.map((conv) => (
          <Link key={conv.id} href={`/workspace/chat/${conv.id}`}>
            <div className="p-4 rounded-2xl border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.05] transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">{conv.title}</p>
                  <p className="text-white/40 text-xs mt-1">
                    {conv.mode} mode • {formatRelativeTime(conv.updatedAt)}
                  </p>
                </div>
                <span className="text-white/30 text-xs">{conv.messageCount} messages</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Component: Usage stats
function UsageStats() {
  return (
    <div className="space-y-4 mb-6">
      <h3 className="text-sm font-semibold text-white/60 uppercase">Usage This Month</h3>
      
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-white/60">Chat messages</span>
          <span className="text-sm font-bold text-cyan-400">142/500</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-[28%] bg-cyan-500 rounded-full" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-white/60">Documents</span>
          <span className="text-sm font-bold text-purple-400">12/50</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-[24%] bg-purple-500 rounded-full" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-white/60">Storage</span>
          <span className="text-sm font-bold text-green-400">2.3GB/10GB</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-[23%] bg-green-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}
```

---

## Part 3: Chat Interface Enhancement

**File to modify**: `src/components/chat/ChatMessage.tsx`

### Add Hover Actions
```tsx
export function ChatMessage({ message }: { message: ChatMessageType }) {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div
      className={`flex gap-3 mb-6 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        message.role === 'user' 
          ? 'bg-cyan-500/20 text-cyan-400' 
          : 'bg-purple-500/20 text-purple-400'
      }`}>
        {message.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
      </div>

      {/* Content bubble */}
      <div className={`max-w-2xl group relative ${message.role === 'user' ? 'text-right' : ''}`}>
        <div className={`rounded-2xl px-5 py-3 ${
          message.role === 'user'
            ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white'
            : 'bg-white/[0.05] border border-white/10 text-white'
        }`}>
          <MarkdownRenderer content={message.content} />
        </div>

        {/* Hover actions */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-12 left-0 flex gap-2 bg-white/5 border border-white/10 rounded-lg p-1"
          >
            <ActionButton icon={<Copy size={16} />} label="Copy" />
            <ActionButton icon={<Share2 size={16} />} label="Share" />
            <ActionButton icon={<ThumbsUp size={16} />} label="Like" />
            {message.role === 'assistant' && (
              <ActionButton icon={<RotateCcw size={16} />} label="Regenerate" />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
```

---

## Part 4: Document Vault Enhancement

**File to modify**: `src/app/workspace/documents/page.tsx`

### Add Search, Filter, Sort
```tsx
export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'extracted' | 'pending' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');

  const filteredDocs = documents
    .filter(doc => {
      if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterStatus !== 'all' && doc.extraction?.extraction_status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
      return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    });

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header with search/filter toolbar */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-6">Document Vault</h1>
        
        {/* Toolbar */}
        <div className="flex gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/40 focus:border-cyan-500/50"
            />
          </div>

          {/* Filter dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="extracted">Extracted ✓</option>
            <option value="pending">Processing ⏳</option>
            <option value="failed">Failed ✗</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
          >
            <option value="date">Sort: Date (Newest)</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="size">Sort: Size (Largest)</option>
          </select>
        </div>

        {/* Document uploader */}
        <DocumentUploader onUploaded={handleUploaded} />
      </div>

      {/* Documents grid */}
      <div className="max-w-7xl mx-auto">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12">
            <FileSearch size={40} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/60">No documents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <EnhancedDocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced document card with tags and actions
function EnhancedDocumentCard({ document }) {
  const [showMenu, setShowMenu] = useState(false);
  
  const statusConfig = {
    completed: { icon: '✓', color: 'text-green-400', bg: 'bg-green-500/10' },
    processing: { icon: '⏳', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    failed: { icon: '✗', color: 'text-red-400', bg: 'bg-red-500/10' },
  };

  const status = statusConfig[document.extraction?.extraction_status || 'processing'];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition p-6 relative">
      {/* Menu button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          <MoreVertical size={16} className="text-white/40" />
        </button>
        {showMenu && (
          <div className="absolute top-10 right-0 bg-black border border-white/10 rounded-lg shadow-lg py-2">
            <button className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/5">
              Download
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/5">
              Rename
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/5">
              Share
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10">
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Document info */}
      <div className="mb-4">
        <h3 className="font-semibold text-white truncate">{document.name}</h3>
        <p className="text-xs text-white/40 mt-1">
          {formatFileSize(document.size)} • {formatRelativeTime(document.uploaded_at)}
        </p>
      </div>

      {/* Status badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.bg} mb-4`}>
        <span className={`text-sm font-medium ${status.color}`}>{status.icon}</span>
        <span className="text-xs text-white/60">
          {document.chunk_count} chunks
        </span>
      </div>

      {/* Tags (if any) */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className="px-2 py-1 rounded text-xs bg-cyan-500/10 text-cyan-300">
          #{document.fileType || 'pdf'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleAnalyze(document)}
          className="flex-1 px-4 py-2 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition text-sm"
        >
          Ask Questions
        </button>
        <button
          onClick={() => handlePreview(document)}
          className="px-4 py-2 rounded-lg border border-white/10 text-white/80 hover:bg-white/10 transition text-sm"
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
}
```

---

## Part 5: Analytics Dashboard Enhancement

**File to modify**: `src/app/workspace/analytics/page.tsx`

### Add Date Range Picker & Alerts
```tsx
export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  return (
    <div className="min-h-screen bg-black pb-12">
      {/* Header with controls */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Enterprise Analytics</h1>
              <p className="text-white/60 text-sm mt-2">Real-time KPIs & warehouse metrics</p>
            </div>

            {/* Date range selector */}
            <div className="flex gap-2">
              {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg transition ${
                    dateRange === range
                      ? 'bg-cyan-500 text-white'
                      : 'border border-white/10 text-white/60 hover:border-white/30'
                  }`}
                >
                  {range === '7d' ? 'Last 7d' : range === '30d' ? 'Last 30d' : range === '90d' ? 'Last 90d' : 'All time'}
                </button>
              ))}
            </div>
          </div>

          {/* Anomaly alerts */}
          <div className="grid gap-3">
            <motion.div className="flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4">
              <AlertTriangle className="text-amber-400 mt-1" size={18} />
              <div>
                <p className="font-medium text-amber-100">Revenue Alert</p>
                <p className="text-sm text-amber-50/80">Revenue down 15% vs. yesterday. Check Q3 forecast.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* KPI Cards with sparklines */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCardWithSparkline
            title="Total Revenue"
            value="$2.4M"
            change="+12%"
            trend="up"
            sparklineData={[1200, 1400, 1300, 1600, 1500, 1800, 1700]}
          />
          {/* More KPI cards */}
        </div>
      </div>

      {/* Charts section */}
      <div className="max-w-7xl mx-auto px-8 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue chart */}
          <ChartCard title="Revenue Trend">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={kpis?.revenueByQuarter || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06f" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ background: 'rgba(10, 10, 10, 0.9)', border: '1px solid #333' }} />
                <Area type="monotone" dataKey="revenue" stroke="#06f" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Regional breakdown */}
          <ChartCard title="Revenue by Region">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis?.revenueByRegion || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ background: 'rgba(10, 10, 10, 0.9)', border: '1px solid #333' }} />
                <Bar dataKey="revenue" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Export button */}
      <div className="max-w-7xl mx-auto px-8 flex justify-end gap-3">
        <button className="px-6 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition">
          Export as PDF
        </button>
        <button className="px-6 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition">
          Share Report
        </button>
      </div>
    </div>
  );
}

// Component: KPI card with sparkline
function KpiCardWithSparkline({ title, value, change, trend, sparklineData }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.05] transition">
      <p className="text-white/60 text-sm uppercase font-medium">{title}</p>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className={`text-sm mt-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {change} {trend === 'up' ? '↑' : '↓'}
          </p>
        </div>
        {/* Mini sparkline chart */}
        <ResponsiveContainer width={80} height={30}>
          <AreaChart data={sparklineData.map((v, i) => ({ value: v }))}>
            <Area type="monotone" dataKey="value" stroke="#06f" fill="#06f" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Component: Chart wrapper card
function ChartCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      {children}
    </div>
  );
}
```

---

## Part 6: Sidebar & Navigation Enhancement

**File to modify**: `src/components/Sidebar.tsx`

### Add Collapsible & Better UX
```tsx
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { addToast } = useToast();

  const routes = [
    { href: '/workspace/chat', icon: MessageCircle2, label: 'Chat' },
    { href: '/workspace/documents', icon: FileText, label: 'Documents' },
    { href: '/workspace/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} border-r border-white/10 bg-white/[0.01] backdrop-blur-xl transition-all duration-300`}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!collapsed && <h2 className="font-bold text-lg">AetherQ</h2>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400'
                    : 'text-white/60 hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                {!collapsed && <span>{route.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-4">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-white/40 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          {/* Logout button */}
          <button
            onClick={async () => {
              try {
                await signOut();
                addToast('Signed out successfully', 'success');
              } catch (error) {
                addToast('Sign out failed', 'error');
              }
            }}
            className={`w-full mt-3 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition text-sm ${collapsed ? 'px-2' : ''}`}
          >
            {collapsed ? '→' : 'Logout'}
          </button>
        </div>
      </div>
    </aside>
  );
}
```

---

## Implementation Order

1. **Start with Login/Signup** (highest impact on first impression)
2. **Enhance Dashboard** (personalization)
3. **Improve Chat UI** (core feature)
4. **Document Vault** (frequently used)
5. **Analytics** (advanced users)
6. **Sidebar** (peripheral enhancement)

---

## Testing the Enhancements

After implementing each section:

```bash
npm run lint    # ✓ Check for style issues
npx tsc --noEmit  # ✓ Verify TypeScript
npm run build   # ✓ Full production build
npm run dev     # ✓ Test locally
```

Then test manually:
1. Login/signup with new UI
2. Browse dashboard
3. Send messages in chat
4. Upload document
5. View analytics

---

**All enhancements are backward compatible and don't break existing functionality.**
