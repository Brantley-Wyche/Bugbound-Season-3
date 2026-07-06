import { useRecentItems } from './useRecentItems.js';

const PRODUCTS = [
  { id: 'p1', name: 'Trail Runner Jacket' },
  { id: 'p2', name: 'Ceramic Pour-Over Kit' },
  { id: 'p3', name: 'Wool Hiking Socks' },
  { id: 'p4', name: 'Cast Iron Skillet' },
];

const MAX_RECENTS = 3;

export default function RecentlyViewedProducts() {
  const { items, addItem, clear } = useRecentItems(MAX_RECENTS);

  return (
    <div className="lv-card">
      <h4 className="lv-heading">🛍️ Product Catalog</h4>
      <p className="lv-muted">Click View on a product to add it to Recently Viewed.</p>
      <ul className="lv-list" data-testid="product-list">
        {PRODUCTS.map((product) => (
          <li key={product.id}>
            <div className="lv-row spread" data-testid="product-row">
              <span data-testid="product-name">{product.name}</span>
              <button
                className="lv-btn"
                data-testid={`view-btn-${product.id}`}
                onClick={() => addItem(product.name)}
              >
                View
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="lv-row spread">
        <h4 className="lv-heading">Recently Viewed</h4>
        <button className="lv-btn" data-testid="clear-btn" onClick={clear}>
          Clear recents
        </button>
      </div>
      {items.length === 0 ? (
        <p className="lv-muted" data-testid="recents-empty">
          Nothing viewed yet.
        </p>
      ) : (
        <ul className="lv-list" data-testid="recents-list">
          {items.map((name, i) => (
            <li key={`${name}-${i}`} data-testid="recent-row">
              <span className="lv-tag" data-testid="recent-name">
                {name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
