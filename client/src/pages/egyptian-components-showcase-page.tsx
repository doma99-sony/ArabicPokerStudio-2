import React from 'react';
import EgyptianComponentsShowcase from '../games/queen-of-egypt-3d/components/EgyptianComponentsShowcase';

/**
 * صفحة لعرض المكونات المصرية
 * تستخدم للتطوير والعرض التقديمي
 */
const EgyptianComponentsShowcasePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <EgyptianComponentsShowcase />
    </div>
  );
};

export default EgyptianComponentsShowcasePage;