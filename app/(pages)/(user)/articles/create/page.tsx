import Breadcrumbs from '@/app/learning/ui/invoices/breadcrumbs';
import CreateForm from '@/app/user/components/articles/create-form';

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Articles', href: '/articles' },
          {
            label: 'Create Article',
            href: '/articles/create',
            active: true,
          },
        ]}
      />
      <CreateForm />
    </main>
  );
}
