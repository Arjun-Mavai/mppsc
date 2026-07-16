import { getAllMainsPapersWithSyllabus } from '@/actions/mains-actions';
import { assertAdmin } from '@/lib/auth';
import SurgicalUpdaterClient from './SurgicalUpdaterClient';

export const dynamic = 'force-dynamic';

export default async function MainsSurgicalUpdaterPage() {
  await assertAdmin();

  const res = await getAllMainsPapersWithSyllabus();
  
  if (!res.success) {
    return (
      <div className="min-h-screen p-8 bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p>Failed to load syllabus data.</p>
          <p className="text-sm mt-2">{res.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <SurgicalUpdaterClient initialPapers={res.data || []} />
    </div>
  );
}
