import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { InterviewSkill } from '@/types/interview';

interface TechnicalRadarChartProps {
  skills: InterviewSkill[];
}

export default function TechnicalRadarChart({ skills }: TechnicalRadarChartProps) {
  const data = skills.map(c => ({
    subject: c.skillName.length > 15 ? c.skillName.substring(0, 15) + '...' : c.skillName,
    fullSubject: c.skillName,
    A: c.score,
    fullMark: 100,
  }));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">Biểu đồ Năng lực Chuyên môn</h3>
      <div className="h-80 w-full flex justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Candidate" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
            <Tooltip formatter={(value: any) => [`${value}/100`, 'Score']} labelFormatter={(label) => data.find(d => d.subject === label)?.fullSubject || label} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
