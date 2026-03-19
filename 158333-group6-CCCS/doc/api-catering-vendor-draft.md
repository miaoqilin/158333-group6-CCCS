# Catering and Vendor API Draft

## Catering APIs

POST /api/catering/bookings  
Create a catering booking

GET /api/catering/bookings  
Get all bookings

GET /api/catering/bookings/:id  
Get booking details

PUT /api/catering/bookings/:id/status  
Update booking status

---

## Vendor APIs

GET /api/vendors  
Get all vendors

POST /api/vendors  
Create vendor

PUT /api/vendors/:id  
Update vendor

DELETE /api/vendors/:id  
Delete vendor

---

## Status Values

pending  
approved  
rejected  
completed  
cancelled  

---

## Notes

This is the initial API draft for catering and vendor modules for Weeks 1–2.