import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';
import CustomersTable from '@/app/ui/customers/table';
import { fetchFilteredCustomers } from '@/app/lib/data';
import { CustomerField, FormattedCustomersTable } from '@/app/lib/definitions';

export const metadata: Metadata = {
  title: 'Customers',
};

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const customers = await fetchFilteredCustomers(searchParams?.query || '');
  
  return <CustomersTable customers={customers} />;
}