DROP TABLE Permissions_Users_TC;
DROP TABLE Permissions_TC;
DROP TABLE Users_TC;

CREATE TABLE Users_TC (
    accountName VARCHAR(26) PRIMARY KEY NOT NULL,
    hashedPass BINARY(60) NOT NULL,
    email VARCHAR(255) NOT NULL,
    displayName VARCHAR(26) NOT NULL
) CHARACTER SET utf8mb4;

CREATE TABLE Permissions_TC (
    id INT(31) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
) CHARACTER SET utf8mb4;

#Many<->Many Lookup Table for Permissions + Users
CREATE TABLE Permissions_Users_TC (
    permissionId INT(31) UNSIGNED,
    userAccountName VARCHAR(26),
    FOREIGN KEY(permissionId) REFERENCES Permissions_TC(id),
    FOREIGN KEY(userAccountName) REFERENCES Users_TC(accountName)
) CHARACTER SET utf8mb4;

