import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode | string;
  category?: string;
  badge?: string;
  icon?: any;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenId?: string;
  className?: string;
}

export default function Accordion({
  items,
  allowMultiple = true,
  defaultOpenId,
  className = "",
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(defaultOpenId ? [defaultOpenId] : [])
  );

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenIds(new Set(items.map((i) => i.id)));
  };

  const collapseAll = () => {
    setOpenIds(new Set());
  };

  return (
    <div className={`accordionRoot ${className}`}>
      <div className="accordionActions">
        <button
          type="button"
          className="accordionToggleBtn"
          onClick={expandAll}
          title="Alle Fragen aufklappen"
        >
          Alle aufklappen
        </button>
        <span className="accordionDivider">•</span>
        <button
          type="button"
          className="accordionToggleBtn"
          onClick={collapseAll}
          title="Alle Fragen zuklappen"
        >
          Alle zuklappen
        </button>
      </div>

      <div className="accordionList">
        {items.map((item) => {
          const isOpen = openIds.has(item.id);
          const Icon = item.icon;

          return (
            <article
              key={item.id}
              className={`accordionItem glass ${isOpen ? "open" : ""}`}
            >
              <button
                type="button"
                className="accordionHeader"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${item.id}`}
                id={`accordion-header-${item.id}`}
              >
                <div className="accordionTitleWrapper">
                  {Icon && (
                    <span className="accordionIconBubble">
                      <Icon size={18} />
                    </span>
                  )}
                  <div className="accordionTitleText">
                    <span className="accordionQuestion">{item.title}</span>
                    {item.category && (
                      <span className="accordionCategoryBadge">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="accordionRightMeta">
                  {item.badge && (
                    <span className="accordionBadge">{item.badge}</span>
                  )}
                  <ChevronDown
                    size={18}
                    className={`accordionChevron ${isOpen ? "rotated" : ""}`}
                  />
                </div>
              </button>

              {isOpen && (
                <div
                  id={`accordion-content-${item.id}`}
                  role="region"
                  aria-labelledby={`accordion-header-${item.id}`}
                  className="accordionBody"
                >
                  <div className="accordionContent">
                    {typeof item.content === "string" ? (
                      <p>{item.content}</p>
                    ) : (
                      item.content
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
