# Member 3 backend source map

- Controllers: `BookingController.java`, `PaymentController.java`
- Services: `BookingService*`, `PaymentService*`, `service/payment/*Processor.java`
- Repositories: `BookingRepository.java`, `PaymentRepository.java`
- Models: `Booking.java`, `BookingStatus.java`, `Payment.java`, `PaymentStatus.java`, `PaymentMethodType.java`
- DTOs: `BookingRequest`, `BookingUpdateRequest`, `BookingStatusUpdateRequest`, `PaymentRequest`, `PaymentUpdateRequest`, `PaymentReceiptDto`

Payment strategy classes simulate a processor and never persist card numbers,
CVVs, account numbers, or payment-provider secrets.
