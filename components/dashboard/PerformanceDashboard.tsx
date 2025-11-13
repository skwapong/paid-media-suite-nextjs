import { css } from '@emotion/react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

// Type assertions for React 18 compatibility
const TypedResponsiveContainer = ResponsiveContainer as any
const TypedAreaChart = AreaChart as any
const TypedArea = Area as any
const TypedXAxis = XAxis as any
const TypedYAxis = YAxis as any
const TypedCartesianGrid = CartesianGrid as any
const TypedTooltip = Tooltip as any
const TypedLegend = Legend as any
const TypedPieChart = PieChart as any
const TypedPie = Pie as any
const TypedCell = Cell as any
const TypedLineChart = LineChart as any
const TypedLine = Line as any
const TypedBarChart = BarChart as any
const TypedBar = Bar as any

// Mock data for demonstration
const performanceData = [
  { date: '2025-01-01', impressions: 12500, clicks: 456, conversions: 45, spend: 1250 },
  { date: '2025-01-02', impressions: 15200, clicks: 523, conversions: 52, spend: 1420 },
  { date: '2025-01-03', impressions: 14800, clicks: 498, conversions: 48, spend: 1380 },
  { date: '2025-01-04', impressions: 16300, clicks: 587, conversions: 61, spend: 1520 },
  { date: '2025-01-05', impressions: 18100, clicks: 642, conversions: 68, spend: 1680 },
  { date: '2025-01-06', impressions: 17500, clicks: 612, conversions: 64, spend: 1590 },
  { date: '2025-01-07', impressions: 19200, clicks: 698, conversions: 72, spend: 1750 },
]

const channelData = [
  { name: 'Google Ads', value: 45, spend: 5200 },
  { name: 'Facebook Ads', value: 30, spend: 3400 },
  { name: 'LinkedIn Ads', value: 15, spend: 1800 },
  { name: 'Twitter Ads', value: 10, spend: 1200 }
]

const campaignData = [
  { campaign: 'Q1 Product Launch', impressions: 45000, clicks: 1200, ctr: 2.67, conversions: 120 },
  { campaign: 'Brand Awareness', impressions: 68000, clicks: 890, ctr: 1.31, conversions: 78 },
  { campaign: 'Retargeting', impressions: 32000, clicks: 980, ctr: 3.06, conversions: 145 },
  { campaign: 'Lead Generation', impressions: 28000, clicks: 756, ctr: 2.70, conversions: 98 }
]

const COLORS = ['#1957DB', '#6F2EFF', '#44BAB8', '#FFB84D']

const PerformanceDashboard = () => {
  const totalImpressions = performanceData.reduce((sum, d) => sum + d.impressions, 0)
  const totalClicks = performanceData.reduce((sum, d) => sum + d.clicks, 0)
  const totalConversions = performanceData.reduce((sum, d) => sum + d.conversions, 0)
  const totalSpend = performanceData.reduce((sum, d) => sum + d.spend, 0)
  const avgCTR = ((totalClicks / totalImpressions) * 100).toFixed(2)
  const avgCVR = ((totalConversions / totalClicks) * 100).toFixed(2)
  const costPerConversion = (totalSpend / totalConversions).toFixed(2)

  return (
    <div css={css`
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      background-color: #F7F8FA;
      overflow-y: auto;
    `}>
      {/* Header */}
      <header css={css`
        background-color: white;
        border-bottom: 1px solid #E5E7EB;
        padding: 24px 32px;
        position: sticky;
        top: 0;
        z-index: 10;
      `}>
        <div css={css`
          max-width: 1400px;
          margin: 0 auto;
        `}>
          <h1 css={css`
            font-family: 'Figtree', sans-serif;
            font-weight: 600;
            font-size: 28px;
            color: #1A1A1A;
            margin: 0 0 8px 0;
          `}>
            Performance Dashboard
          </h1>
          <p css={css`
            font-family: 'Figtree', sans-serif;
            font-size: 14px;
            color: #6B7280;
            margin: 0;
          `}>
            Track and analyze your campaign performance in real-time
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main css={css`
        flex: 1;
        padding: 32px;
        max-width: 1400px;
        width: 100%;
        margin: 0 auto;
      `}>
        {/* KPI Cards */}
        <div css={css`
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        `}>
          <KPICard
            title="Total Impressions"
            value={totalImpressions.toLocaleString()}
            change="+12.5%"
            isPositive={true}
            icon="👁️"
          />
          <KPICard
            title="Total Clicks"
            value={totalClicks.toLocaleString()}
            change="+8.3%"
            isPositive={true}
            icon="🖱️"
          />
          <KPICard
            title="Conversions"
            value={totalConversions.toLocaleString()}
            change="+15.7%"
            isPositive={true}
            icon="🎯"
          />
          <KPICard
            title="Total Spend"
            value={`$${totalSpend.toLocaleString()}`}
            change="+5.2%"
            isPositive={false}
            icon="💰"
          />
          <KPICard
            title="Avg CTR"
            value={`${avgCTR}%`}
            change="+2.1%"
            isPositive={true}
            icon="📊"
          />
          <KPICard
            title="Avg CVR"
            value={`${avgCVR}%`}
            change="+3.4%"
            isPositive={true}
            icon="📈"
          />
          <KPICard
            title="Cost/Conversion"
            value={`$${costPerConversion}`}
            change="-8.9%"
            isPositive={true}
            icon="💵"
          />
        </div>

        {/* Charts Grid */}
        <div css={css`
          display: grid;
          gap: 24px;
        `}>
          {/* Performance Over Time */}
          <ChartCard title="Performance Over Time">
            <TypedResponsiveContainer width="100%" height={300}>
              <TypedAreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1957DB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1957DB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6F2EFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6F2EFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <TypedCartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <TypedXAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <TypedYAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <TypedTooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
                <TypedLegend wrapperStyle={{ paddingTop: '20px' }} />
                <TypedArea
                  type="monotone"
                  dataKey="impressions"
                  stroke="#1957DB"
                  fillOpacity={1}
                  fill="url(#colorImpressions)"
                  strokeWidth={2}
                />
                <TypedArea
                  type="monotone"
                  dataKey="clicks"
                  stroke="#6F2EFF"
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                  strokeWidth={2}
                />
              </TypedAreaChart>
            </TypedResponsiveContainer>
          </ChartCard>

          {/* Two Column Layout */}
          <div css={css`
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 24px;
          `}>
            {/* Channel Distribution */}
            <ChartCard title="Spend by Channel">
              <TypedResponsiveContainer width="100%" height={300}>
                <TypedPieChart>
                  <TypedPie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => entry.name}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <TypedCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </TypedPie>
                  <TypedTooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  />
                </TypedPieChart>
              </TypedResponsiveContainer>
            </ChartCard>

            {/* Conversions Over Time */}
            <ChartCard title="Conversions & Spend Trend">
              <TypedResponsiveContainer width="100%" height={300}>
                <TypedLineChart data={performanceData}>
                  <TypedCartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <TypedXAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <TypedYAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <TypedYAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <TypedTooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  />
                  <TypedLegend wrapperStyle={{ paddingTop: '20px' }} />
                  <TypedLine
                    yAxisId="left"
                    type="monotone"
                    dataKey="conversions"
                    stroke="#44BAB8"
                    strokeWidth={3}
                    dot={{ fill: '#44BAB8', r: 4 }}
                  />
                  <TypedLine
                    yAxisId="right"
                    type="monotone"
                    dataKey="spend"
                    stroke="#FFB84D"
                    strokeWidth={3}
                    dot={{ fill: '#FFB84D', r: 4 }}
                  />
                </TypedLineChart>
              </TypedResponsiveContainer>
            </ChartCard>
          </div>

          {/* Campaign Performance */}
          <ChartCard title="Campaign Performance Comparison">
            <TypedResponsiveContainer width="100%" height={300}>
              <TypedBarChart data={campaignData}>
                <TypedCartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <TypedXAxis dataKey="campaign" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <TypedYAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <TypedTooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
                <TypedLegend wrapperStyle={{ paddingTop: '20px' }} />
                <TypedBar dataKey="clicks" fill="#1957DB" radius={[8, 8, 0, 0]} />
                <TypedBar dataKey="conversions" fill="#6F2EFF" radius={[8, 8, 0, 0]} />
              </TypedBarChart>
            </TypedResponsiveContainer>
          </ChartCard>

          {/* Campaign Table */}
          <div css={css`
            background-color: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          `}>
            <h3 css={css`
              font-family: 'Figtree', sans-serif;
              font-weight: 600;
              font-size: 18px;
              color: #1A1A1A;
              margin: 0 0 20px 0;
            `}>
              Campaign Details
            </h3>
            <div css={css`
              overflow-x: auto;
            `}>
              <table css={css`
                width: 100%;
                border-collapse: collapse;

                th {
                  font-family: 'Figtree', sans-serif;
                  font-weight: 600;
                  font-size: 13px;
                  color: #6B7280;
                  text-align: left;
                  padding: 12px;
                  border-bottom: 2px solid #E5E7EB;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }

                td {
                  font-family: 'Figtree', sans-serif;
                  font-size: 14px;
                  color: #1A1A1A;
                  padding: 16px 12px;
                  border-bottom: 1px solid #F3F4F6;
                }

                tr:last-child td {
                  border-bottom: none;
                }

                tr:hover {
                  background-color: #F9FAFB;
                }
              `}>
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                    <th>Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignData.map((campaign, index) => (
                    <tr key={index}>
                      <td css={css`font-weight: 500;`}>{campaign.campaign}</td>
                      <td>{campaign.impressions.toLocaleString()}</td>
                      <td>{campaign.clicks.toLocaleString()}</td>
                      <td>
                        <span css={css`
                          display: inline-block;
                          padding: 4px 8px;
                          background-color: ${campaign.ctr > 2.5 ? '#D1FAE5' : '#FEF3C7'};
                          color: ${campaign.ctr > 2.5 ? '#065F46' : '#92400E'};
                          border-radius: 4px;
                          font-size: 13px;
                          font-weight: 500;
                        `}>
                          {campaign.ctr}%
                        </span>
                      </td>
                      <td css={css`font-weight: 600; color: #1957DB;`}>
                        {campaign.conversions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

interface KPICardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: string
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, isPositive, icon }) => {
  return (
    <div css={css`
      background-color: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
    `}>
      <div css={css`
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      `}>
        <div css={css`
          font-family: 'Figtree', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        `}>
          {title}
        </div>
        <span css={css`font-size: 20px;`}>{icon}</span>
      </div>
      <div css={css`
        font-family: 'Figtree', sans-serif;
        font-weight: 700;
        font-size: 28px;
        color: #1A1A1A;
        margin-bottom: 8px;
      `}>
        {value}
      </div>
      <div css={css`
        display: flex;
        align-items: center;
        gap: 4px;
      `}>
        <span css={css`
          font-family: 'Figtree', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: ${isPositive ? '#059669' : '#DC2626'};
        `}>
          {change}
        </span>
        <span css={css`
          font-family: 'Figtree', sans-serif;
          font-size: 12px;
          color: #9CA3AF;
        `}>
          vs last period
        </span>
      </div>
    </div>
  )
}

interface ChartCardProps {
  title: string
  children: React.ReactNode
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  return (
    <div css={css`
      background-color: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    `}>
      <h3 css={css`
        font-family: 'Figtree', sans-serif;
        font-weight: 600;
        font-size: 18px;
        color: #1A1A1A;
        margin: 0 0 20px 0;
      `}>
        {title}
      </h3>
      {children}
    </div>
  )
}

export default PerformanceDashboard
