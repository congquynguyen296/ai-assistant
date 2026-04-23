# Feature: Knowledge Graph + Concept Map

## 1) Muc tieu
- Bien tri thuc trong tai lieu thanh cac nut (concept) va lien ket (relation) de nguoi hoc nhin thay buc tranh tong quan.
- Tang kha nang hieu nhanh, ghi nho, va dieu huong den doan noi dung lien quan.
- Tao nen diem khac biet ve trai nghiem hoc (visual learning).

## 2) Doi tuong su dung
- Nguoi hoc muon hieu cau truc kien thuc trong tai lieu dai.
- Nguoi dung muon xem lien ket giua cac y va hoc theo chu de.

## 3) Pham vi
- Tao graph cho moi document (ban dau), sau do mo rong multi-document.
- Hien thi Concept Map trong tab rieng o trang Document Detail.
- Ho tro tim kiem, zoom, va click xem trich dan.

## 4) Gia tri mang lai
- Giam thoi gian doc tuyen tinh, tang hoc theo lien ket.
- Tang ty le quay lai vi nguoi dung co the on tap nhanh bang so do.

## 5) User stories
- As a user, toi muon thay ban do concept de hieu nhanh noi dung chinh.
- As a user, toi muon click vao mot concept de xem giai thich + trich dan.
- As a user, toi muon loc cac concept theo chu de hoac do quan trong.

## 6) Luong chinh
1. User mo document -> chon tab Concept Map.
2. Backend goi AI de trich concept + quan he tu text / chunk.
3. Client render graph (nodes + edges) va cho phep tuong tac.
4. User click node -> xem thong tin (dinh nghia, vi du, trich dan, related nodes).

## 7) Du lieu dau vao / dau ra
### Input
- documentId
- extractedText (tu database hoac from chunk store)
- chunks + chunk_index

### Output
- nodes: id, label, summary, importance, tags
- edges: source, target, relation, weight
- citations: chunk_index[]

## 8) De xuat mo hinh du lieu
### ConceptNode
- id: string
- label: string
- summary: string
- importance: number (0-1)
- tags: string[]
- citations: number[] (chunk_index)

### ConceptEdge
- source: string
- target: string
- relation: string ("is-a", "part-of", "causes", "relates-to")
- weight: number (0-1)

## 9) API de xuat
### POST /api/ai/concept-map
Request:
{
  "documentId": "...",
  "maxNodes": 40,
  "minImportance": 0.2
}

Response:
{
  "documentId": "...",
  "nodes": [ConceptNode],
  "edges": [ConceptEdge]
}

## 10) UI/UX
a) Tab Concept Map trong Document Detail.
- Canvas graph (pan/zoom).
- Side panel hien thong tin node.

b) Interaction
- Click node => show detail + cac trich dan.
- Hover edge => show relation.

## 11) Khong phai pham vi ban dau
- Graph cho multi-doc.
- Live collaboration.
- Import concept map tu nguon ngoai.

## 12) KPI
- Thoi gian o lai trang document.
- Ty le click vao node.
- Ty le nguoi dung tra loi dung quiz sau khi xem map.

## 13) Ky thuat goi y
- Build graph offline sau khi ingest hoan tat.
- Cache graph theo documentId.
- Neu AI tra ve qua nhieu node, auto prune theo importance.

## 14) Rủi ro va giam thieu
- Graph sai relation -> hien thi citation de user kiem chung.
- Qua nhieu node -> gioi han maxNodes + cluster.

