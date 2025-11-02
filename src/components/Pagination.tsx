//src/components/Pagination.tsx
'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }
  
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center" aria-label="Pagination">
      <div className="flex -space-x-px rounded-md shadow-sm">
        <Link
          href={createPageURL(currentPage - 1)}
          className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
          aria-disabled={currentPage === 1}
        >
          <span className="sr-only">Previous</span>
          &laquo;
        </Link>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={createPageURL(page)}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
          >
            {page}
          </Link>
        ))}

        <Link
          href={createPageURL(currentPage + 1)}
          className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
          aria-disabled={currentPage >= totalPages}
        >
          <span className="sr-only">Next</span>
          &raquo;
        </Link>
      </div>
    </nav>
  )
}

export default Pagination