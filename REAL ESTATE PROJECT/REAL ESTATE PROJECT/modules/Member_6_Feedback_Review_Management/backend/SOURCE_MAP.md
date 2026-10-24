# Member 6 backend source map

- Controller: `backend/src/main/java/com/realestate/portal/controller/ReviewController.java`
- Services: `backend/src/main/java/com/realestate/portal/service/ReviewService.java`, `ReviewServiceImpl.java`
- Repository: `backend/src/main/java/com/realestate/portal/repository/ReviewRepository.java`
- Model: `backend/src/main/java/com/realestate/portal/model/Review.java`
- DTOs: `ReviewRequest.java`, `PropertyReviewSummaryDto.java`

The service enforces one review per user/property and accepts ratings only from
1 through 5. Only the review author may alter or delete their review.
