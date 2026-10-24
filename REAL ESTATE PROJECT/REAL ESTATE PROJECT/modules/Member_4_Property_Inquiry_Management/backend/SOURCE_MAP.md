# Member 4 backend source map

- Controller: `backend/src/main/java/com/realestate/portal/controller/InquiryController.java`
- Services: `backend/src/main/java/com/realestate/portal/service/InquiryService.java`, `InquiryServiceImpl.java`
- Repository: `backend/src/main/java/com/realestate/portal/repository/InquiryRepository.java`
- Models: `backend/src/main/java/com/realestate/portal/model/Inquiry.java`, `InquiryStatus.java`
- DTOs: `InquiryRequest.java`, `InquiryUpdateRequest.java`, `InquiryReplyRequest.java`

Buyers can only modify their own unanswered inquiries. Sellers can only respond
to inquiries for listings they own.
