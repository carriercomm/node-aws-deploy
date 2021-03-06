-- MySQL dump 10.13  Distrib 5.6.19, for osx10.9 (x86_64)
--
-- Host: localhost    Database: aws_deploy
-- ------------------------------------------------------
-- Server version	5.6.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `awd_applications`
--

DROP TABLE IF EXISTS `awd_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `awd_applications` (
  `deployment_id` varchar(45) NOT NULL,
  `application_name` varchar(100) NOT NULL,
  `application_environment` text NOT NULL,
  `application_bucket` text NOT NULL,
  PRIMARY KEY (`deployment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `awd_deployments`
--

DROP TABLE IF EXISTS `awd_deployments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `awd_deployments` (
  `deployment_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `deployment_name` varchar(45) NOT NULL,
  `deployment_created_at` datetime NOT NULL,
  `deployment_created_by` bigint(20) NOT NULL,
  `deployment_updated_at` datetime DEFAULT NULL,
  `deployment_updated_by` bigint(20) DEFAULT NULL,
  `deployment_auto_package` tinyint(1) NOT NULL DEFAULT '0',
  `deployment_auto_deploy` tinyint(1) NOT NULL DEFAULT '0',
  `deployment_auto_clean` tinyint(10) NOT NULL DEFAULT '0',
  PRIMARY KEY (`deployment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `awd_healthchecks`
--

DROP TABLE IF EXISTS `awd_healthchecks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `awd_healthchecks` (
  `healthcheck_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `deployment_id` bigint(20) NOT NULL,
  `healthcheck_type` enum('ping') NOT NULL,
  `healthcheck_name` varchar(32) NOT NULL,
  `healthcheck_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `healthcheck_port` int(11) NOT NULL DEFAULT '80',
  `healthcheck_uri` text NOT NULL,
  PRIMARY KEY (`healthcheck_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `awd_log`
--

DROP TABLE IF EXISTS `awd_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `awd_log` (
  `log_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `deployment_id` bigint(20) DEFAULT NULL,
  `log_type` enum('info','warning','error') NOT NULL,
  `log_event` varchar(32) NOT NULL,
  `log_data` text NOT NULL,
  `log_timestamp` datetime NOT NULL,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `awd_repositories`
--

DROP TABLE IF EXISTS `awd_repositories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `awd_repositories` (
  `deployment_id` bigint(20) NOT NULL,
  `repository_type` enum('github') NOT NULL,
  `repository_created_by` bigint(20) NOT NULL,
  `repository_created_at` datetime NOT NULL,
  `repository_state` varchar(64) NOT NULL,
  `repository_url` text,
  `repository_credentials` text,
  `repository_secret` text,
  PRIMARY KEY (`deployment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `awd_users`
--

DROP TABLE IF EXISTS `awd_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `awd_users` (
  `user_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_email` text NOT NULL,
  `user_name` text NOT NULL,
  `user_pass` varchar(64) NOT NULL,
  `user_level` int(11) DEFAULT '0',
  `user_created_at` datetime NOT NULL,
  `user_created_from` varchar(45) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-01-06 22:50:18
