import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Store, UpdateStoresOrderRequest } from '../types/store';
import './StoreOrderModal.css';

interface StoreOrderModalProps {
  stores: Store[];
  onClose: () => void;
  onSubmit: (data: UpdateStoresOrderRequest) => Promise<void>;
}

const StoreOrderModal: React.FC<StoreOrderModalProps> = ({ stores, onClose, onSubmit }) => {
  const [orderedStores, setOrderedStores] = useState<Store[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // orderNo로 정렬, orderNo가 없으면 뒤로
    const sorted = [...stores].sort((a, b) => {
      if (a.orderNo === undefined && b.orderNo === undefined) return 0;
      if (a.orderNo === undefined) return 1;
      if (b.orderNo === undefined) return -1;
      return a.orderNo - b.orderNo;
    });
    setOrderedStores(sorted);
  }, [stores]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(orderedStores);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedStores(items);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const orderData: UpdateStoresOrderRequest = orderedStores.map((store, index) => ({
        marketId: store.marketId,
        orderNo: index + 1
      }));
      await onSubmit(orderData);
      onClose();
    } catch (error) {
      console.error('노출 순서 변경 실패:', error);
      alert('노출 순서 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container store-order-modal">
        <div className="modal-header">
          <h2 className="modal-title">매장 노출 순서 편집</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            매장을 드래그하여 순서를 변경할 수 있습니다. 위에 있을수록 먼저 표시됩니다.
          </p>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="stores">
              {(provided) => (
                <div
                  className="store-order-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {orderedStores.map((store, index) => (
                    <Draggable
                      key={store.marketId}
                      draggableId={store.marketId.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`store-order-item ${snapshot.isDragging ? 'dragging' : ''}`}
                        >
                          <div className="drag-handle">⋮⋮</div>
                          <div className="order-number">{index + 1}</div>
                          <div className="store-info">
                            <div className="store-thumbnail-tiny">
                              {store.thumbnail ? (
                                <img
                                  src={store.thumbnail.startsWith('http') ? store.thumbnail : `${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/image/${store.thumbnail}`}
                                  alt={store.marketName}
                                />
                              ) : (
                                <span>📷</span>
                              )}
                            </div>
                            <div className="store-name">{store.marketName}</div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn--secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '적용 중...' : '순서 적용'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreOrderModal;