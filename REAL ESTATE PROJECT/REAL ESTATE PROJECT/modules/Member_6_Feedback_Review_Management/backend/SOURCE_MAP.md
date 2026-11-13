# Member 6 backend source map

- Controller: `backend/src/main/java/com/realestate/portal/controller/ReviewController.java`
- Services: `backend/src/main/java/com/realestate/portal/service/ReviewService.java`, `ReviewServiceImpl.java`
- Repository: `backend/src/main/java/com/realestate/portal/repository/ReviewRepository.java`
- Model: `backend/src/main/java/com/realestate/portal/model/Review.java`
- DTOs: `ReviewRequest.java`, `PropertyReviewSummaryDto.java`

The service validates ratings from 1 through 5 and allows only the review
author to edit; the author or an admin may delete. The active file-backed
implementation does not currently enforce one review per user/property. A
unique constraint in the optional SQL schema is not active until a
database-backed repository is used.
