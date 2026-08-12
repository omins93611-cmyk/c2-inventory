import { useState } from 'react'
import './App.css'

function App() {
  const [page, setPage] = useState('dashboard')
  const [search, setSearch] = useState('')

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('inventoryItems')
    return saved ? JSON.parse(saved) : []
  })

  const [usageList, setUsageList] = useState(() => {
    const saved = localStorage.getItem('usageList')
    return saved ? JSON.parse(saved) : []
  })

  const [showItemForm, setShowItemForm] = useState(false)
  const [showUsageForm, setShowUsageForm] = useState(false)

  const [editingItemId, setEditingItemId] = useState(null)
  const [editingUsageId, setEditingUsageId] = useState(null)

  const [itemForm, setItemForm] = useState({
    code: '',
    name: '',
    stock: '',
    unit: '',
    minStock: ''
  })

  const [usageForm, setUsageForm] = useState({
    itemId: '',
    date: '',
    amount: '',
    note: ''
  })

  const saveItems = (newItems) => {
    setItems(newItems)
    localStorage.setItem('inventoryItems', JSON.stringify(newItems))
  }

  const saveUsage = (newUsage) => {
    setUsageList(newUsage)
    localStorage.setItem('usageList', JSON.stringify(newUsage))
  }


  /* =========================
     품목 신규 등록창
  ========================= */

  const openNewItemForm = () => {
    setEditingItemId(null)

    setItemForm({
      code: '',
      name: '',
      stock: '',
      unit: '',
      minStock: ''
    })

    setShowItemForm(true)
  }


  /* =========================
     품목 수정창
  ========================= */

  const openEditItemForm = (item) => {
    setEditingItemId(item.id)

    setItemForm({
      code: item.code,
      name: item.name,
      stock: String(item.stock),
      unit: item.unit,
      minStock: String(item.minStock)
    })

    setShowItemForm(true)
  }


  /* =========================
     품목 저장
     신규 / 수정 둘 다 처리
  ========================= */

  const saveItemRecord = () => {
    const code = itemForm.code.trim()
    const name = itemForm.name.trim()

    if (!code || !name) {
      alert('품목코드와 품목명을 입력해주세요.')
      return
    }

    const duplicate = items.some(
      item =>
        item.code === code &&
        item.id !== editingItemId
    )

    if (duplicate) {
      alert('이미 사용 중인 품목코드입니다.')
      return
    }

    // 신규 품목
    if (editingItemId === null) {
      const newItem = {
        id: Date.now(),
        code,
        name,
        stock: Number(itemForm.stock) || 0,
        unit: itemForm.unit.trim(),
        minStock: Number(itemForm.minStock) || 0
      }

      saveItems([...items, newItem])
    }

    // 기존 품목 수정
    else {
      const updatedItems = items.map(item =>
        item.id === editingItemId
          ? {
              ...item,
              code,
              name,
              stock: Number(itemForm.stock) || 0,
              unit: itemForm.unit.trim(),
              minStock: Number(itemForm.minStock) || 0
            }
          : item
      )

      saveItems(updatedItems)

      // 품목명/코드/단위가 변경되면
      // 기존 사용현황에도 변경 내용 반영
      const updatedUsage = usageList.map(usage =>
        usage.itemId === editingItemId
          ? {
              ...usage,
              itemCode: code,
              itemName: name,
              unit: itemForm.unit.trim()
            }
          : usage
      )

      saveUsage(updatedUsage)
    }

    setEditingItemId(null)

    setItemForm({
      code: '',
      name: '',
      stock: '',
      unit: '',
      minStock: ''
    })

    setShowItemForm(false)
  }


  /* =========================
     품목 삭제
  ========================= */

  const deleteItem = (id) => {
    const target = items.find(item => item.id === id)

    const hasUsage = usageList.some(
      usage => usage.itemId === id
    )

    if (hasUsage) {
      alert(
        '이 품목은 사용현황 기록이 있어서 삭제할 수 없습니다.\n사용현황 기록을 먼저 확인해주세요.'
      )
      return
    }

    if (
      !window.confirm(
        `${target?.name} 품목을 삭제할까요?`
      )
    ) {
      return
    }

    saveItems(
      items.filter(item => item.id !== id)
    )
  }


  /* =========================
     새 사용기록
  ========================= */

  const openNewUsageForm = () => {
    if (items.length === 0) {
      alert('먼저 품목관리에서 품목을 등록해주세요.')
      return
    }

    setEditingUsageId(null)

    setUsageForm({
      itemId: '',
      date: '',
      amount: '',
      note: ''
    })

    setShowUsageForm(true)
  }


  /* =========================
     사용기록 수정창
  ========================= */

  const openEditUsageForm = (usage) => {
    setEditingUsageId(usage.id)

    setUsageForm({
      itemId: String(usage.itemId),
      date: usage.date,
      amount: String(usage.amount),
      note: usage.note || ''
    })

    setShowUsageForm(true)
  }


  /* =========================
     사용기록 저장
  ========================= */

  const saveUsageRecord = () => {
    const itemId = Number(usageForm.itemId)
    const amount = Number(usageForm.amount)

    const selectedItem = items.find(
      item => item.id === itemId
    )

    if (!selectedItem) {
      alert('사용 물품을 선택해주세요.')
      return
    }

    if (!usageForm.date) {
      alert('사용일을 입력해주세요.')
      return
    }

    if (!amount || amount <= 0) {
      alert('사용량을 입력해주세요.')
      return
    }


    /* 신규 사용 기록 */

    if (editingUsageId === null) {
      if (amount > Number(selectedItem.stock)) {
        alert(
          `현재 재고는 ${selectedItem.stock}${selectedItem.unit}입니다.\n재고보다 많이 사용할 수 없습니다.`
        )
        return
      }

      const updatedItems = items.map(item =>
        item.id === itemId
          ? {
              ...item,
              stock:
                Number(item.stock) - amount
            }
          : item
      )

      saveItems(updatedItems)

      const newUsage = {
        id: Date.now(),
        itemId,
        itemCode: selectedItem.code,
        itemName: selectedItem.name,
        date: usageForm.date,
        amount,
        unit: selectedItem.unit,
        note: usageForm.note.trim()
      }

      saveUsage([
        newUsage,
        ...usageList
      ])
    }


    /* 기존 사용 기록 수정 */

    else {
      const oldUsage = usageList.find(
        usage =>
          usage.id === editingUsageId
      )

      if (!oldUsage) return

      // 기존 사용량을 먼저 원래 재고에 복구
      let calculatedItems = items.map(item =>
        item.id === oldUsage.itemId
          ? {
              ...item,
              stock:
                Number(item.stock) +
                Number(oldUsage.amount)
            }
          : item
      )

      const newTargetItem =
        calculatedItems.find(
          item => item.id === itemId
        )

      if (!newTargetItem) {
        alert('품목을 찾을 수 없습니다.')
        return
      }

      if (
        amount >
        Number(newTargetItem.stock)
      ) {
        alert(
          `사용 가능한 재고는 ${newTargetItem.stock}${newTargetItem.unit}입니다.`
        )
        return
      }

      // 수정한 사용량 다시 차감
      calculatedItems =
        calculatedItems.map(item =>
          item.id === itemId
            ? {
                ...item,
                stock:
                  Number(item.stock) -
                  amount
              }
            : item
        )

      saveItems(calculatedItems)

      const updatedUsage =
        usageList.map(usage =>
          usage.id === editingUsageId
            ? {
                ...usage,
                itemId,
                itemCode:
                  newTargetItem.code,
                itemName:
                  newTargetItem.name,
                date:
                  usageForm.date,
                amount,
                unit:
                  newTargetItem.unit,
                note:
                  usageForm.note.trim()
              }
            : usage
        )

      saveUsage(updatedUsage)
    }

    setEditingUsageId(null)

    setUsageForm({
      itemId: '',
      date: '',
      amount: '',
      note: ''
    })

    setShowUsageForm(false)
  }


  /* =========================
     사용기록 삭제
     재고 자동 복구
  ========================= */

  const deleteUsage = (id) => {
    const usage = usageList.find(
      item => item.id === id
    )

    if (!usage) return

    if (
      !window.confirm(
        `${usage.itemName} 사용기록을 삭제할까요?\n${usage.amount}${usage.unit}이 재고에 다시 복구됩니다.`
      )
    ) {
      return
    }

    const updatedItems =
      items.map(item =>
        item.id === usage.itemId
          ? {
              ...item,
              stock:
                Number(item.stock) +
                Number(usage.amount)
            }
          : item
      )

    saveItems(updatedItems)

    saveUsage(
      usageList.filter(
        item => item.id !== id
      )
    )
  }


  /* =========================
     통계
  ========================= */

  const lowStockItems =
    items.filter(
      item =>
        Number(item.stock) <=
        Number(item.minStock)
    )

  const filteredItems =
    items.filter(item => {
      const keyword =
        search.toLowerCase()

      return (
        item.code
          .toLowerCase()
          .includes(keyword) ||
        item.name
          .toLowerCase()
          .includes(keyword)
      )
    })

  const today =
    new Date()
      .toISOString()
      .slice(0, 10)


  return (
    <div className="app">

      {/* 사이드바 */}

      <aside className="sidebar">

        <div className="logo">
          <h2>C2 109호</h2>
          <p>적층 재고 관리</p>
        </div>

        <div className="menu">

          <button
            className={
              page === 'dashboard'
                ? 'active'
                : ''
            }
            onClick={() =>
              setPage('dashboard')
            }
          >
            대시보드
          </button>

          <button
            className={
              page === 'stock'
                ? 'active'
                : ''
            }
            onClick={() =>
              setPage('stock')
            }
          >
            재고조회
          </button>

          <button
            className={
              page === 'items'
                ? 'active'
                : ''
            }
            onClick={() =>
              setPage('items')
            }
          >
            품목관리
          </button>

          <button
            className={
              page === 'usage'
                ? 'active'
                : ''
            }
            onClick={() =>
              setPage('usage')
            }
          >
            사용현황
          </button>

        </div>

      </aside>


      {/* 메인 */}

      <main className="main">

        {/* 대시보드 */}

        {page === 'dashboard' && (
          <>
            <div className="page-header">
              <div>
                <h1>대시보드</h1>
                <p>
                  현재 재고 현황
                </p>
              </div>
            </div>


            <div className="cards">

              <div className="card">
                <span>총 품목 수</span>

                <strong>
                  {items.length}
                </strong>

                <small>
                  등록 품목
                </small>
              </div>


              <div className="card warning-card">
                <span>재고 부족</span>

                <strong>
                  {lowStockItems.length}
                </strong>

                <small>
                  기준재고 이하
                </small>
              </div>


              <div className="card">
                <span>오늘 사용</span>

                <strong>
                  {
                    usageList.filter(
                      item =>
                        item.date === today
                    ).length
                  }
                </strong>

                <small>
                  오늘 사용 기록
                </small>
              </div>

            </div>


            <section className="content-box dashboard-section">

              <div className="section-title">
                <h2>
                  재고 부족 
                </h2>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="empty small-empty">
                  충분합니다.
                </div>
              ) : (
                <table>

                  <thead>
                    <tr>
                      <th>품목코드</th>
                      <th>품목명</th>
                      <th>현재재고</th>
                      <th>기준재고</th>
                    </tr>
                  </thead>

                  <tbody>

                    {lowStockItems.map(
                      item => (
                        <tr key={item.id}>

                          <td>
                            {item.code}
                          </td>

                          <td>
                            {item.name}
                          </td>

                          <td className="danger-text">
                            {item.stock}{' '}
                            {item.unit}
                          </td>

                          <td>
                            {item.minStock}{' '}
                            {item.unit}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>
              )}

            </section>


            <section className="content-box dashboard-section">

              <div className="section-title">
                <h2>
                  최근 사용 현황
                </h2>
              </div>

              {usageList.length === 0 ? (
                <div className="empty small-empty">
                  빨리 사용하세요.
                </div>
              ) : (
                <table>

                  <thead>
                    <tr>
                      <th>물품명</th>
                      <th>사용일</th>
                      <th>사용량</th>
                      <th>비고</th>
                    </tr>
                  </thead>

                  <tbody>

                    {usageList
                      .slice(0, 5)
                      .map(usage => (
                        <tr key={usage.id}>

                          <td>
                            {usage.itemName}
                          </td>

                          <td>
                            {usage.date}
                          </td>

                          <td>
                            {usage.amount}{' '}
                            {usage.unit}
                          </td>

                          <td>
                            {usage.note || '-'}
                          </td>

                        </tr>
                      ))}

                  </tbody>

                </table>
              )}

            </section>
          </>
        )}


        {/* 재고조회 */}

        {page === 'stock' && (
          <>
            <div className="page-header">

              <div>
                <h1>재고조회</h1>

                <p>
                 재고 현황
                </p>
              </div>

            </div>


            <section className="content-box">

              <input
                className="search-input"
                placeholder="품목명 검색..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />


              {filteredItems.length === 0 ? (
                <div className="empty">
                  등록해주세요
                </div>
              ) : (
                <table>

                  <thead>
                    <tr>
                      <th>품목코드</th>
                      <th>품목명</th>
                      <th>현재재고</th>
                      <th>단위</th>
                      <th>상태</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredItems.map(
                      item => {
                        const isLow =
                          Number(item.stock) <=
                          Number(item.minStock)

                        return (
                          <tr key={item.id}>

                            <td>
                              {item.code}
                            </td>

                            <td>
                              {item.name}
                            </td>

                            <td className="stock-number">
                              {item.stock}
                            </td>

                            <td>
                              {item.unit}
                            </td>

                            <td>
                              {isLow ? (
                                <span className="status-low">
                                  부족
                                </span>
                              ) : (
                                <span className="status-good">
                                  정상
                                </span>
                              )}
                            </td>

                          </tr>
                        )
                      }
                    )}

                  </tbody>

                </table>
              )}

            </section>
          </>
        )}


        {/* 품목관리 */}

        {page === 'items' && (
          <>
            <div className="page-header">

              <div>
                <h1>품목관리</h1>

                <p>
                  C2 109호 물품 관리
                </p>
              </div>


              <button
                className="primary-button"
                onClick={openNewItemForm}
              >
                + 품목 추가
              </button>

            </div>


            <section className="content-box">

              {items.length === 0 ? (
                <div className="empty">

                  등록된 품목이 없습니다.

                  <br />

                  품목 추가 버튼있어요. 

                </div>
              ) : (
                <table>

                  <thead>
                    <tr>
                      <th>품목코드</th>
                      <th>품목명</th>
                      <th>현재재고</th>
                      <th>단위</th>
                      <th>기준재고</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>

                    {items.map(item => (
                      <tr key={item.id}>

                        <td>
                          {item.code}
                        </td>

                        <td>
                          {item.name}
                        </td>

                        <td>
                          {item.stock}
                        </td>

                        <td>
                          {item.unit}
                        </td>

                        <td>
                          {item.minStock}
                        </td>


                        <td className="actions">

                          <button
                            className="stock-button"
                            onClick={() =>
                              openEditItemForm(item)
                            }
                          >
                            수정
                          </button>


                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteItem(item.id)
                            }
                          >
                            삭제
                          </button>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>
              )}

            </section>
          </>
        )}


        {/* 사용현황 */}

        {page === 'usage' && (
          <>
            <div className="page-header">

              <div>
                <h1>사용현황</h1>

                <p>
                  사용 품목 및 사용량 기재해주세요.
                </p>
              </div>


              <button
                className="primary-button"
                onClick={openNewUsageForm}
              >
                + 사용 현황
              </button>

            </div>


            <section className="content-box">

              {usageList.length === 0 ? (
                <div className="empty">
                  아직 사용 기록이 없습니다.
                </div>
              ) : (
                <table>

                  <thead>
                    <tr>
                      <th>품목코드</th>
                      <th>물품명</th>
                      <th>사용일</th>
                      <th>사용량</th>
                      <th>비고</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>

                    {usageList.map(
                      usage => (
                        <tr key={usage.id}>

                          <td>
                            {usage.itemCode}
                          </td>

                          <td>
                            {usage.itemName}
                          </td>

                          <td>
                            {usage.date}
                          </td>

                          <td>
                            {usage.amount}{' '}
                            {usage.unit}
                          </td>

                          <td>
                            {usage.note || '-'}
                          </td>

                          <td className="actions">

                            <button
                              className="stock-button"
                              onClick={() =>
                                openEditUsageForm(
                                  usage
                                )
                              }
                            >
                              수정
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                deleteUsage(
                                  usage.id
                                )
                              }
                            >
                              삭제
                            </button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>
              )}

            </section>
          </>
        )}

      </main>


      {/* 품목 추가 / 수정 팝업 */}

      {showItemForm && (
        <div className="modal-background">

          <div className="modal">

            <div className="modal-header">

              <h2>
                {editingItemId === null
                  ? '품목 추가'
                  : '품목 수정'}
              </h2>


              <button
                className="close"
                onClick={() => {
                  setShowItemForm(false)
                  setEditingItemId(null)
                }}
              >
                ×
              </button>

            </div>


            <label>
              품목코드
            </label>

            <input
              value={itemForm.code}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  code: e.target.value
                })
              }
              placeholder="예: C2_001"
            />


            <label>
              품목명
            </label>

            <input
              value={itemForm.name}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  name: e.target.value
                })
              }
              placeholder="물품명을 입력하세요"
            />


            <label>
              현재 재고
            </label>

            <input
              type="number"
              step="any"
              value={itemForm.stock}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  stock: e.target.value
                })
              }
              placeholder="현재 보유 수량"
            />


            <label>
              단위
            </label>

            <input
              value={itemForm.unit}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  unit: e.target.value
                })
              }
              placeholder="예: 개 / g / kg / L"
            />


            <label>
              재고 부족 기준
            </label>

            <input
              type="number"
              step="any"
              value={itemForm.minStock}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  minStock:
                    e.target.value
                })
              }
              placeholder="이 수량 이하일 때 부족"
            />


            <button
              className="save-button"
              onClick={saveItemRecord}
            >
              {editingItemId === null
                ? '품목 등록'
                : '수정 내용 저장'}
            </button>

          </div>

        </div>
      )}


      {/* 사용 현황 추가 / 수정 */}

      {showUsageForm && (
        <div className="modal-background">

          <div className="modal">

            <div className="modal-header">

              <h2>
                {editingUsageId === null
                  ? '사용 현황'
                  : '사용 현황 수정'}
              </h2>


              <button
                className="close"
                onClick={() => {
                  setShowUsageForm(false)
                  setEditingUsageId(null)
                }}
              >
                ×
              </button>

            </div>


            <label>
              사용 물품
            </label>

            <select
              value={usageForm.itemId}
              onChange={(e) =>
                setUsageForm({
                  ...usageForm,
                  itemId: e.target.value
                })
              }
            >

              <option value="">
                물품을 선택하세요
              </option>


              {items.map(item => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                  {' / 현재 '}
                  {item.stock}
                  {item.unit}
                </option>
              ))}

            </select>


            <label>
              사용일
            </label>

            <input
              type="date"
              value={usageForm.date}
              onChange={(e) =>
                setUsageForm({
                  ...usageForm,
                  date: e.target.value
                })
              }
            />


            <label>
              사용량
            </label>

            <input
              type="number"
              step="any"
              value={usageForm.amount}
              onChange={(e) =>
                setUsageForm({
                  ...usageForm,
                  amount:
                    e.target.value
                })
              }
              placeholder="사용량 입력"
            />


            <label>
              비고
            </label>

            <input
              value={usageForm.note}
              onChange={(e) =>
                setUsageForm({
                  ...usageForm,
                  note:
                    e.target.value
                })
              }
              placeholder="필요한 경우 입력"
            />


            <button
              className="save-button"
              onClick={saveUsageRecord}
            >
              {editingUsageId === null
                ? '사용 기록 저장'
                : '수정 내용 저장'}
            </button>

          </div>

        </div>
      )}

    </div>
  )
}

export default App