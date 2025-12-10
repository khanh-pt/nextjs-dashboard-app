import { useCallback, useEffect, useRef, useState } from 'react';
import { CustomerField } from '@/app/learning/lib/definitions';
import { State } from '@/app/learning/lib/actions';
import { CheckCircleIcon, UserCircleIcon } from '@heroicons/react/24/solid';

export function Dropdown({
  initCustomers,
  initSelectedCustomer,
  state,
}: {
  initCustomers: CustomerField[];
  initSelectedCustomer: CustomerField | null;
  state: State;
}) {
  const [customers, setCustomers] = useState(initCustomers);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerField | null>(initSelectedCustomer || null);

  const loadMore = useCallback(async () => {
    if (loading) return;
    if (!hasMore) return;

    setLoading(true);

    const nextPage = page + 1;
    const res = await fetch(`/api/customers?page=${nextPage}`);
    const data = await res.json();

    // If no more users returned → stop further loading
    if (!data.customers || data.customers.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    setCustomers((prev) => [...prev, ...data.customers]);
    setPage(nextPage);
    setLoading(false);
  }, [page, loading, hasMore]);

  // Infinite scroll listener
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    function handleScroll() {
      if (!el) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
        // near bottom → load more
        loadMore();
      }
    }

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [page, loading, open, loadMore]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;

      // If click is outside the wrapper → close dropdown
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    // Add listener when dropdown is open
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative mb-4" ref={wrapperRef}>
      <label htmlFor="customer" className="mb-2 block text-sm font-medium">
        Choose customer
      </label>
      <div className="relative bg-white">
        <div
          id="customer"
          className="w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
          aria-describedby="customer-error"
          onClick={() => setOpen((o) => !o)}
        >
          {selectedCustomer ? (
            selectedCustomer.name
          ) : (
            <div className="text-gray-500">Select a customer</div>
          )}
        </div>
        <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
      </div>
      <input
        type="hidden"
        name="customerId"
        defaultValue={selectedCustomer ? selectedCustomer.id : ''}
      />
      {open && (
        <div
          ref={listRef}
          className="absolute mt-1 w-full max-h-[240px] overflow-y-auto border bg-white shadow-md rounded z-10"
        >
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="relative p-2 pl-10 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setSelectedCustomer(customer);
                setOpen(false);
              }}
            >
              {customer.name}
              {customer.id === selectedCustomer?.id && (
                <CheckCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-green-500" />
              )}
            </div>
          ))}

          {loading && (
            <div className="p-2 text-center text-sm text-gray-500">
              Loading...
            </div>
          )}
        </div>
      )}
      <div id="customer-error" aria-live="polite" aria-atomic="true">
        {state.errors.customerId &&
          state.errors.customerId.map((error: string) => (
            <p className="mt-1 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>
    </div>
  );
}
