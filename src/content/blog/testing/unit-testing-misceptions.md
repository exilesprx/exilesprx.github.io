---
title: Why Mocking External Services in Unit Tests Is Not Only Okay - It's Necessary
description: A practical look at why unit tests should mock external services and databases, and how properly separating unit, integration, and acceptance tests leads to faster, more reliable, and more meaningful test suites.
slug: 'testing/unit-testing-misconceptions'
pubDate: 1738878971000
tags: ['testing', 'unit']
isDraft: false
---

A common refrain I hear from developers is: _If we mock every external service, what’s the point of testing?_ This mindset is, in my opinion, flawed.

Unit tests are designed to test your code's logic, not the behavior of external systems. If your unit tests are passing only because an API or database returns certain data, you're not testing anything meaningful-you're essentially testing the external service, which is not the responsibility of your unit tests.

Consider databases as a concrete example. Many unit tests include actual database access, thinking this makes the tests more "realistic." In reality, you are not testing your database schema or database capabilities in a unit test. Those concerns belong in integration tests. Unit tests should instead focus on the business logic that processes or transforms the data, using mocks or in-memory representations to simulate database responses. This ensures the tests are deterministic, fast, and focused on your code, not the database.

Similarly, when your code consumes data from an external API, the business logic that processes that data is what should be under test. Mocking the external service allows you to provide consistent, deterministic inputs, making it easy to catch regressions in your logic and decoupling your tests from network failures or changes in third-party services.

Now, what about testing the external service itself? That's where integration tests or functional/acceptance tests come in:

- **Integration tests** verify that your system interacts correctly with the external service or database. They may hit a real instance (or a sandbox/staging version) to ensure communication works as expected.
- **Functional/acceptance tests** verify that the system behaves correctly from an end-user perspective, which may include real responses from external services. These tests are higher-level than unit tests and ensure the full workflow-including external dependencies-works correctly.

I'll use php as an example:

```php
<?php
// src/UserService.php
class UserService
{
    private $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getDiscountedPrice(int $userId, float $price): float
    {
        $user = $this->userRepository->find($userId);

        if ($user['loyaltyLevel'] === 'gold') {
            return $price * 0.8; // 20% discount
        }

        return $price;
    }
}


<?php
use PHPUnit\Framework\TestCase;

class UserServiceTest extends TestCase
{
    public function testGoldUserGetsDiscount()
    {
        // Mock the repository
        $mockRepo = $this->createMock(UserRepositoryInterface::class);

        // Define what find() should return
        $mockRepo->method('find')->willReturn(['id' => 1, 'loyaltyLevel' => 'gold']);

        $service = new UserService($mockRepo);

        $discountedPrice = $service->getDiscountedPrice(1, 100);

        $this->assertEquals(80, $discountedPrice);
    }

    public function testRegularUserGetsNoDiscount()
    {
        $mockRepo = $this->createMock(UserRepositoryInterface::class);
        $mockRepo->method('find')->willReturn(['id' => 2, 'loyaltyLevel' => 'regular']);

        $service = new UserService($mockRepo);

        $discountedPrice = $service->getDiscountedPrice(2, 100);

        $this->assertEquals(100, $discountedPrice);
    }
}
```

In short:

- **Unit tests**: Mock external services and databases; test your logic.
- **Integration/acceptance tests**: Test interactions with real services or databases.

Complaining about mocking often signals that your tests aren't actually testing meaningful behavior. Properly structured tests-unit tests with mocks for logic, and integration/functional tests for real service behavior-give you the best of both worlds: fast, reliable unit tests and confidence that your system works end-to-end.
