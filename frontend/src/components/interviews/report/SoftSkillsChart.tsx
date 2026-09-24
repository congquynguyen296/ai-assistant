import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { InterviewSkill } from '@/types/interview';

interface SoftSkillsChartProps {
  skills: InterviewSkill[];
}

export default function SoftSkillsChart({ skills }: SoftSkillsChartProps) {
  const data = skills.map(c => ({
    name: c.skillName.length > 20 ? c.skillName.substring(0, 20) + '...' : c.skillName,
    fullName: c.skillName,
    score: c.score,
  }));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">Tư duy & Giao tiếp</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
            <Tooltip formatter={(value: any) => [`${value}/100`, 'Score']} labelFormatter={(label) => data.find(d => d.name === label)?.fullName || label} />
            <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
