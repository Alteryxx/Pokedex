import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if viewing on mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    // Show fewer pages on mobile
    const maxPagesToShow = isMobile ? 3 : 5;
    
    if (totalPages <= maxPagesToShow) {
      // If there are fewer pages than our maximum, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate the start and end of the page range around the current page
      let start = Math.max(2, currentPage - (isMobile ? 0 : 1));
      let end = Math.min(totalPages - 1, currentPage + (isMobile ? 0 : 1));
      
      // If we're at the start, show more pages after
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, isMobile ? 2 : 4);
      }
      
      // If we're at the end, show more pages before
      if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - (isMobile ? 1 : 3));
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pageNumbers.push('...');
      }
      
      // Add pages in the calculated range
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 my-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center p-1 sm:p-2 rounded-md ${
          currentPage === 1 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-2 py-1">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page)}
              className={`px-2 sm:px-3 py-1 rounded-md text-sm sm:text-base ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center p-1 sm:p-2 rounded-md ${
          currentPage === totalPages 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Next page"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;