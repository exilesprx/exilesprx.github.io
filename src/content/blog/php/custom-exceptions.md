---
title: Overengineering Custom Exceptions - A Case Study
description: Implementing custom exceptions
slug: 'php/custom-exceptions'
pubDate: 1768863155
tags: ['php', 'exceptions']
isDraft: true
---

Today, I encountered a custom exception implementation that illustrates how easy it is to overcomplicate a simple concept. While I've anonymized the code by replacing the actual application name with "Domain," the issues remain instructive:

```php
<?php
namespace Domain\Exceptions;
class DomainErrorException extends \Exception
{
    private $domain_error = null;
    public function __construct($message = "", $code = 0, $previous = null, $domain_error = null)
    {
        $this->domain = $domain_error;
        parent::__construct($message, $code, $previous);
    }
    public function getErrorMessage()
    {
        return 'Domain: ' . $this->domain_error->message . ' - ' . $this->domain_error->detailed_error;
    }
    public function getDomainError()
    {
        return $this->domain_error;
    }
}
```

### Problems with This Approach

This implementation introduces several issues:

- **Parameter redundancy** – The `$domain_error` argument serves essentially the same purpose as the standard `$message` parameter
- **Non-standard signature** – Adding a fourth parameter breaks compatibility with the standard Exception interface
- **Unnecessary complexity** – The class name already provides context; a `$domain_error` property adds minimal value
- **Tight coupling** – The implementation is tightly coupled to the structure of the `$domain_error` object
- **Confusing API** – Two different methods for retrieving error messages (`getErrorMessage()` and `getMessage()`) will confuse developers
- **Bypassing conventions** – The standard `getMessage()` method is ignored in favor of a custom alternative

The typical usage made these problems even more apparent:

```php
<?php
$json = '{"message": "Some custom domain exception message", "detailed_error": "Some details"}';
$message = json_decode($json);

try {
    throw new DomainErrorException("", 0, null, $message);
} catch (DomainErrorException $e) {
    # Is this the error I want?
    Logger::error($e->getDomainError());

    # Or is it this one?
    Logger::error($e->getErrorMessage());
}
```

Notice the empty string and zeros passed for standard parameters, while the actual error information is relegated to a fourth, non-standard argument.

### A Simpler Solution

I couldn't identify a valid reason for this complexity. The implementation below achieves the same goal while adhering to standard exception practices:

```php
<?php
namespace Domain\Exceptions;
class DomainErrorException extends \Exception
{
    public function __construct($message = "", $code = 0, $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }

    public static function fromDomainError($message)
    {
        return new self(sprintf("Domain: %s", $message));
    }
}

$message = sprintf("%s - %s", "Some normal message", "Additional details");
try {
    throw DomainErrorException::fromDomainError($message);
} catch(DomainErrorException $e) {
    Logger::error($e->getMessage());
}
```

### Benefits of This Approach

- **Standard interface** – Works anywhere a standard Exception is expected
- **Liskov Substitution Principle** – Can be substituted for its parent class without breaking functionality
- **Flexibility** – Developers can construct messages as needed without being constrained by object structure
- **Conventional API** – Uses the standard `getMessage()` method
- **Named constructor** – The static factory method clearly communicates intent

Sometimes the simplest solution is the best one. Custom exceptions should extend functionality, not complicate it.
